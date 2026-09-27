const pool = require('../utils/db');
const getBookmarks = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      'SELECT * FROM "VideoBookmark" WHERE "userId"=$1 AND "sessionId"=$2 ORDER BY "videoTime" ASC',
      [req.user.id, sessionId]
    );
    res.json({ bookmarks: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
const createBookmark = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { videoTime, label } = req.body;
    if (videoTime === undefined) return res.status(400).json({ message: 'زمان ویدیو الزامی است' });
    const result = await pool.query(
      'INSERT INTO "VideoBookmark" ("userId", "sessionId", "videoTime", label) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, sessionId, videoTime, label || '']
    );
    res.status(201).json({ bookmark: result.rows[0] });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "VideoBookmark" WHERE id=$1 AND "userId"=$2', [id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
module.exports = { getBookmarks, createBookmark, deleteBookmark };
