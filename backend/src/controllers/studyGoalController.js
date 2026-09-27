const pool = require('../utils/db');

const getGoals = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      'SELECT * FROM "StudyGoal" WHERE "userId"=$1 AND "courseId"=$2 ORDER BY "week" DESC LIMIT 4',
      [req.user.id, courseId]
    );
    res.json({ goals: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const setGoal = async (req, res) => {
  try {
    const { courseId, targetSessionsPerWeek } = req.body;
    if (!courseId || !targetSessionsPerWeek) return res.status(400).json({ message: 'اطلاعات ناقص است' });

    // هفته جاری (دوشنبه)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const result = await pool.query(
      `INSERT INTO "StudyGoal" ("userId", "courseId", "targetSessionsPerWeek", "week")
       VALUES ($1,$2,$3,$4)
       ON CONFLICT ("userId", "courseId", "week") DO UPDATE SET "targetSessionsPerWeek"=$3
       RETURNING *`,
      [req.user.id, courseId, targetSessionsPerWeek, monday.toISOString().split('T')[0]]
    );
    res.status(201).json({ goal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getGoals, setGoal };
