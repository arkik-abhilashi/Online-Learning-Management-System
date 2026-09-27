const pool = require('../utils/db');

// علامت‌گذاری تکمیل جلسه (toggle)
const markSessionCompleted = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // بررسی ثبت‌نام در دوره
    const session = await pool.query('SELECT * FROM "Session" WHERE id = $1', [sessionId]);
    if (session.rows.length === 0) return res.status(404).json({ message: 'جلسه یافت نشد' });

    const courseId = session.rows[0].courseId;
    const enrollment = await pool.query(
      'SELECT * FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2',
      [userId, courseId]
    );
    if (enrollment.rows.length === 0) return res.status(403).json({ message: 'ثبت‌نام نکرده‌اید' });

    // بررسی وضعیت فعلی
    const current = await pool.query(
      'SELECT * FROM "StudentSessionProgress" WHERE "userId" = $1 AND "sessionId" = $2',
      [userId, sessionId]
    );

    let newStatus;
    if (current.rows.length === 0) {
      // ایجاد و true
      await pool.query(
        'INSERT INTO "StudentSessionProgress" ("userId", "sessionId", completed) VALUES ($1, $2, true)',
        [userId, sessionId]
      );
      newStatus = true;
    } else {
      // برعکس کردن
      newStatus = !current.rows[0].completed;
      await pool.query(
        'UPDATE "StudentSessionProgress" SET completed = $1, "updatedAt" = NOW() WHERE id = $2',
        [newStatus, current.rows[0].id]
      );
    }

    // محاسبه درصد پیشرفت جدید
    const allSessions = await pool.query('SELECT id FROM "Session" WHERE "courseId" = $1', [courseId]);
    const completedCount = await pool.query(
      'SELECT COUNT(*)::int FROM "StudentSessionProgress" WHERE "userId" = $1 AND "sessionId" IN (SELECT id FROM "Session" WHERE "courseId" = $2) AND completed = true',
      [userId, courseId]
    );
    const progress = allSessions.rows.length > 0 ? Math.round((completedCount.rows[0].count / allSessions.rows.length) * 100) : 0;
    await pool.query(
      'UPDATE "Enrollment" SET progress = $1 WHERE "userId" = $2 AND "courseId" = $3',
      [progress, userId, courseId]
    );

    res.json({ completed: newStatus, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// دریافت وضعیت همه جلسات یک دوره برای دانشجوی جاری
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const sessions = await pool.query('SELECT id, title, "order" FROM "Session" WHERE "courseId" = $1 ORDER BY "order"', [courseId]);
    const progressRows = await pool.query(
      'SELECT "sessionId", completed FROM "StudentSessionProgress" WHERE "userId" = $1 AND "sessionId" IN (SELECT id FROM "Session" WHERE "courseId" = $2)',
      [userId, courseId]
    );
    const progressMap = {};
    progressRows.rows.forEach(r => { progressMap[r.sessionId] = r.completed; });

    const result = sessions.rows.map(s => ({
      ...s,
      completed: progressMap[s.id] || false
    }));

    const enrollment = await pool.query('SELECT progress FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2', [userId, courseId]);
    const overallProgress = enrollment.rows.length > 0 ? enrollment.rows[0].progress : 0;

    res.json({ sessions: result, overallProgress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

module.exports = { markSessionCompleted, getCourseProgress };
