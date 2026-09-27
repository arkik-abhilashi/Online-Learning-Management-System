const pool = require('../utils/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// تاریخ میلادی به فرمت انگلیسی
function englishDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const checkCompletion = async (userId, courseId) => {
  const sessions = await pool.query('SELECT id FROM "Session" WHERE "courseId" = $1', [courseId]);
  if (sessions.rows.length === 0) return false;

  for (const session of sessions.rows) {
    const seen = await pool.query(
      'SELECT * FROM "StudentSessionProgress" WHERE "userId" = $1 AND "sessionId" = $2 AND completed = true',
      [userId, session.id]
    );
    if (seen.rows.length === 0) return false;

    const quizzes = await pool.query('SELECT id FROM "Quiz" WHERE "sessionId" = $1', [session.id]);
    for (const quiz of quizzes.rows) {
      const attempts = await pool.query(
        'SELECT * FROM "StudentQuizAttempt" WHERE "userId" = $1 AND "quizId" = $2',
        [userId, quiz.id]
      );
      if (attempts.rows.length === 0) return false;
      const best = Math.max(...attempts.rows.map(a => (a.score / a.totalMarks) * 100));
      if (best < 50) return false;
    }
  }
  return true;
};

const getInstructorName = async (courseId) => {
  const course = await pool.query(
    'SELECT u."fullName" FROM "Course" c JOIN "User" u ON c."instructorId" = u.id WHERE c.id = $1',
    [courseId]
  );
  // برای گواهی انگلیسی، نام را به عنوان "Instructor" برمی‌گردانیم
  // می‌توانید در آینده نام انگلیسی ذخیره کنید
  return 'Instructor';
};

const generatePDF = async (userId, courseId, certificateCode) => {
  const dir = path.join(__dirname, '..', '..', 'uploads', 'certificates');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, certificateCode + '.pdf');

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  doc.pipe(fs.createWriteStream(filePath));

  // دریافت اطلاعات (فقط برای نمایش نام دانشجو – نام اصلی ممکن است فارسی باشد، 
  // اما در PDF با فونت پیش‌فرض ناخوانا می‌شود. پس آن را به صورت "Student" جایگزین می‌کنیم)
  const userResult = await pool.query('SELECT "fullName" FROM "User" WHERE id = $1', [userId]);
  // استفاده از نام انگلیسی ثابت
  const studentName = 'Student'; 
  const instructorName = await getInstructorName(courseId);
  const courseQuery = await pool.query('SELECT title FROM "Course" WHERE id = $1', [courseId]);
  // عنوان دوره نیز ممکن است فارسی باشد، آن را به "the course" تبدیل می‌کنیم
  const courseTitle = 'the course';

  // طراحی
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f8ff');

  const centerX = doc.page.width / 2;
  let yPos = 80;

  doc.font('Helvetica');

  doc.fontSize(35).fillColor('#003366');
  doc.text('Certificate of Completion', centerX, yPos, { align: 'center' });
  yPos += 60;

  doc.fontSize(18).fillColor('black');
  doc.text('This is to certify that', centerX, yPos, { align: 'center' });
  yPos += 35;

  doc.fontSize(26).fillColor('#000080');
  doc.text(studentName, centerX, yPos, { align: 'center' });
  yPos += 40;

  doc.fontSize(18).fillColor('black');
  doc.text('has successfully completed the course', centerX, yPos, { align: 'center' });
  yPos += 35;

  doc.fontSize(24).fillColor('#000080');
  doc.text(courseTitle, centerX, yPos, { align: 'center' });
  yPos += 50;

  doc.fontSize(14).fillColor('black');
  doc.text(`Instructor: ${instructorName}`, centerX, yPos, { align: 'center' });
  yPos += 30;

  doc.text(`Date: ${englishDate()}`, centerX, yPos, { align: 'center' });
  yPos += 30;

  doc.text(`Certificate Code: ${certificateCode}`, centerX, yPos, { align: 'center' });

  doc.end();
};

const issueCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const course = await pool.query('SELECT * FROM "Course" WHERE id = $1', [courseId]);
    if (course.rows.length === 0 || (course.rows[0].instructorId !== req.user.id && req.user.role !== 'ADMIN'))
      return res.status(403).json({ message: 'Forbidden' });

    const completed = await checkCompletion(userId, courseId);
    if (!completed) return res.status(400).json({ message: 'Student not completed all requirements' });

    const existing = await pool.query(
      'SELECT * FROM "Certificate" WHERE "userId" = $1 AND "courseId" = $2',
      [userId, courseId]
    );
    if (existing.rows.length > 0) {
      return res.json({
        certificate: existing.rows[0],
        pdfUrl: `/uploads/certificates/${existing.rows[0].certificateCode}.pdf`
      });
    }

    const code = 'CERT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    await pool.query(
      'INSERT INTO "Certificate" ("userId", "courseId", "certificateCode") VALUES ($1,$2,$3)',
      [userId, courseId, code]
    );

    await generatePDF(userId, courseId, code);
    await pool.query('UPDATE "Enrollment" SET "certificateIssued" = true WHERE "userId" = $1 AND "courseId" = $2', [userId, courseId]);

    res.json({ certificate: { userId, courseId, certificateCode: code }, pdfUrl: `/uploads/certificates/${code}.pdf` });
  } catch (err) {
    console.error('issueCertificate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateCertificateForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await pool.query('SELECT * FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2', [userId, courseId]);
    if (enrollment.rows.length === 0) return res.status(403).json({ message: 'Not enrolled' });

    const completed = await checkCompletion(userId, courseId);
    if (!completed) return res.status(400).json({ message: 'You have not completed all requirements' });

    const existing = await pool.query(
      'SELECT * FROM "Certificate" WHERE "userId" = $1 AND "courseId" = $2',
      [userId, courseId]
    );
    if (existing.rows.length > 0) {
      return res.json({
        certificate: existing.rows[0],
        pdfUrl: `/uploads/certificates/${existing.rows[0].certificateCode}.pdf`
      });
    }

    const code = 'CERT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    await pool.query(
      'INSERT INTO "Certificate" ("userId", "courseId", "certificateCode") VALUES ($1,$2,$3)',
      [userId, courseId, code]
    );

    await generatePDF(userId, courseId, code);
    await pool.query('UPDATE "Enrollment" SET "certificateIssued" = true WHERE "userId" = $1 AND "courseId" = $2', [userId, courseId]);

    res.json({ certificate: { userId, courseId, certificateCode: code }, pdfUrl: `/uploads/certificates/${code}.pdf` });
  } catch (err) {
    console.error('generateCertificateForStudent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, co.title as "courseTitle"
       FROM "Certificate" c JOIN "Course" co ON c."courseId" = co.id
       WHERE c."userId" = $1`,
      [req.user.id]
    );
    res.json({ certificates: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { issueCertificate, generateCertificateForStudent, getMyCertificates };
