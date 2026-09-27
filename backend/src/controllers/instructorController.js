const pool = require('../utils/db');

// آمار شخصی مدرس (دوره‌ها، دانشجویان، میانگین نمرات)
const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // تعداد دوره‌ها
    const coursesCount = await pool.query('SELECT COUNT(*)::int FROM "Course" WHERE "instructorId"=$1', [userId]);

    // تعداد کل دانشجویان (ثبت‌نام‌های موفق)
    const studentsCount = await pool.query(
      'SELECT COUNT(DISTINCT e."userId")::int FROM "Enrollment" e JOIN "Course" c ON e."courseId"=c.id WHERE c."instructorId"=$1',
      [userId]
    );

    // میانگین نمرات در آزمون‌ها (برای آزمون‌های دوره‌های این مدرس)
    const avgScore = await pool.query(
      `SELECT AVG((a.score::float / a."totalMarks"::float)*100)::float as avg
       FROM "StudentQuizAttempt" a
       JOIN "Quiz" q ON a."quizId"=q.id
       JOIN "Session" s ON q."sessionId"=s.id
       JOIN "Course" c ON s."courseId"=c.id
       WHERE c."instructorId"=$1 AND a.score IS NOT NULL`,
      [userId]
    );

    res.json({
      courses: coursesCount.rows[0].count,
      students: studentsCount.rows[0].count,
      avgScore: avgScore.rows[0].avg || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// لیست دانشجویان یک دوره خاص به همراه پیشرفت و نمرات
const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await pool.query('SELECT * FROM "Course" WHERE id=$1', [courseId]);
    if (course.rows.length===0 || course.rows[0].instructorId !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const students = await pool.query(
      `SELECT u.id, u.email, u."fullName", e.progress,
         (SELECT json_agg(json_build_object('quizTitle', q.title, 'score', a.score, 'totalMarks', a."totalMarks", 'date', a."submittedAt"))
          FROM "StudentQuizAttempt" a
          JOIN "Quiz" q ON a."quizId"=q.id
          JOIN "Session" s ON q."sessionId"=s.id
          WHERE a."userId"=u.id AND s."courseId"=$1
         ) as quizzes
       FROM "Enrollment" e
       JOIN "User" u ON e."userId"=u.id
       WHERE e."courseId"=$1`,
      [courseId]
    );

    res.json({ students: students.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// جزئیات کامل یک دانشجو در یک دوره
const getStudentDetail = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // جلسات دیده شده
    const sessions = await pool.query(
      `SELECT s.id, s.title, s."order", COALESCE(ssp.completed, false) as completed
       FROM "Session" s
       LEFT JOIN "StudentSessionProgress" ssp ON s.id=ssp."sessionId" AND ssp."userId"=$1
       WHERE s."courseId"=$2
       ORDER BY s."order"`,
      [studentId, courseId]
    );

    // نمرات آزمون‌ها
    const quizzes = await pool.query(
      `SELECT q.title as "quizTitle", a.score, a."totalMarks", a."submittedAt"
       FROM "StudentQuizAttempt" a
       JOIN "Quiz" q ON a."quizId"=q.id
       JOIN "Session" s ON q."sessionId"=s.id
       WHERE a."userId"=$1 AND s."courseId"=$2
       ORDER BY a."submittedAt"`,
      [studentId, courseId]
    );

    const user = await pool.query('SELECT id, email, "fullName" FROM "User" WHERE id=$1', [studentId]);

    res.json({
      user: user.rows[0],
      sessions: sessions.rows,
      quizzes: quizzes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// گزارش آماری هر سوال یک آزمون (چند درصد درست پاسخ دادند)
const getQuizQuestionStats = async (req, res) => {
  try {
    const { quizId } = req.params;

    const questions = await pool.query(
      `SELECT q.id, q.text, q.marks,
        (SELECT COUNT(*) FROM "StudentAnswer" sa
         JOIN "Option" o ON sa."selectedOptionId"=o.id
         WHERE sa."questionId"=q.id AND o."isCorrect") as correct_count,
        (SELECT COUNT(*) FROM "StudentAnswer" sa WHERE sa."questionId"=q.id) as total_answers
       FROM "Question" q WHERE q."quizId"=$1`,
      [quizId]
    );

    const stats = questions.rows.map(q => ({
      ...q,
      correctPercentage: q.total_answers > 0 ? Math.round((q.correct_count / q.total_answers)*100) : 0
    }));

    res.json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyStats, getCourseStudents, getStudentDetail, getQuizQuestionStats };
