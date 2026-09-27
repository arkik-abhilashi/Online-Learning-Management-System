const pool = require('../utils/db');

const enroll = async (req, res) => {
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ message: 'Students only' });
    const { courseId } = req.params;

    const course = await pool.query('SELECT * FROM "Course" WHERE id = $1 AND "isPublished" = true', [courseId]);
    if (course.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    const exists = await pool.query(
      'SELECT * FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2',
      [req.user.id, courseId]
    );
    if (exists.rows.length > 0) return res.status(400).json({ message: 'Already enrolled' });

    const result = await pool.query(
      'INSERT INTO "Enrollment" ("userId", "courseId") VALUES ($1, $2) RETURNING *',
      [req.user.id, courseId]
    );
    res.status(201).json({ enrollment: result.rows[0] });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const getMyEnrollments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.title as "courseTitle", c."imageUrl", c.price, c.level,
              cat.name as "categoryName", u."fullName" as "instructorName"
       FROM "Enrollment" e
       JOIN "Course" c ON e."courseId" = c.id
       LEFT JOIN "Category" cat ON c."categoryId" = cat.id
       LEFT JOIN "User" u ON c."instructorId" = u.id
       WHERE e."userId" = $1`,
      [req.user.id]
    );
    res.json({ enrollments: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const getCourseLearning = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await pool.query(
      'SELECT * FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2',
      [req.user.id, courseId]
    );
    if (enrollment.rows.length === 0) return res.status(404).json({ message: 'Not enrolled' });

    const course = await pool.query('SELECT * FROM "Course" WHERE id = $1', [courseId]);
    const sessions = await pool.query(
      'SELECT * FROM "Session" WHERE "courseId" = $1 ORDER BY "order" ASC',
      [courseId]
    );

    res.json({ course: course.rows[0], enrollment: enrollment.rows[0], sessions: sessions.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const submitQuiz = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await client.query('SELECT * FROM "Quiz" WHERE id = $1', [quizId]);
    if (quiz.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Not found' }); }

    const session = await client.query('SELECT * FROM "Session" WHERE id = $1', [quiz.rows[0].sessionId]);
    const enrollment = await client.query(
      'SELECT * FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2',
      [req.user.id, session.rows[0].courseId]
    );
    if (enrollment.rows.length === 0) { await client.query('ROLLBACK'); return res.status(403).json({ message: 'Not enrolled' }); }

    const questions = await client.query('SELECT * FROM "Question" WHERE "quizId" = $1', [quizId]);
    let score = 0;
    let totalMarks = 0;

    const attemptResult = await client.query(
      'INSERT INTO "StudentQuizAttempt" ("userId", "quizId") VALUES ($1, $2) RETURNING *',
      [req.user.id, quizId]
    );
    const attempt = attemptResult.rows[0];

    for (const q of questions.rows) {
      totalMarks += q.marks;
      const userAnswer = answers.find(a => a.questionId === q.id);
      const correctOption = await client.query(
        'SELECT * FROM "Option" WHERE "questionId" = $1 AND "isCorrect" = true',
        [q.id]
      );

      let selectedOptionId = userAnswer?.selectedOptionId || null;
      if (selectedOptionId && correctOption.rows[0]?.id === selectedOptionId) {
        score += q.marks;
      }

      await client.query(
        'INSERT INTO "StudentAnswer" ("attemptId", "questionId", "selectedOptionId") VALUES ($1, $2, $3)',
        [attempt.id, q.id, selectedOptionId]
      );
    }

    await client.query(
      'UPDATE "StudentQuizAttempt" SET score = $1, "totalMarks" = $2 WHERE id = $3',
      [score, totalMarks, attempt.id]
    );

    await client.query('COMMIT');
    res.json({ attempt: { ...attempt, score, totalMarks }, score, totalMarks });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const result = await pool.query(
      'SELECT * FROM "StudentQuizAttempt" WHERE "userId" = $1 AND "quizId" = $2 ORDER BY "submittedAt" DESC',
      [req.user.id, quizId]
    );
    res.json({ attempts: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { enroll, getMyEnrollments, getCourseLearning, submitQuiz, getQuizAttempts };
