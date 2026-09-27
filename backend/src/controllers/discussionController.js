const pool = require('../utils/db');
const getDiscussions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      `SELECT d.*, u."fullName" as "userName" FROM "Discussion" d
       LEFT JOIN "User" u ON d."userId" = u.id
       WHERE d."sessionId"=$1 AND d.parentId IS NULL
       ORDER BY d."createdAt" DESC`,
      [sessionId]
    );
    const discussions = [];
    for (const d of result.rows) {
      const replies = await pool.query(
        `SELECT r.*, u."fullName" as "userName" FROM "Discussion" r
         LEFT JOIN "User" u ON r."userId" = u.id
         WHERE r.parentId=$1 ORDER BY r."createdAt" ASC`,
        [d.id]
      );
      discussions.push({ ...d, replies: replies.rows });
    }
    res.json({ discussions });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
const createDiscussion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, parentId } = req.body;
    if (!content) return res.status(400).json({ message: 'متن پیام الزامی است' });
    const result = await pool.query(
      'INSERT INTO "Discussion" ("sessionId", "userId", "parentId", content) VALUES ($1,$2,$3,$4) RETURNING *',
      [sessionId, req.user.id, parentId || null, content]
    );
    const user = await pool.query('SELECT "fullName" FROM "User" WHERE id=$1', [req.user.id]);
    const discussion = { ...result.rows[0], userName: user.rows[0].fullName };
    res.status(201).json({ discussion });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
module.exports = { getDiscussions, createDiscussion };
