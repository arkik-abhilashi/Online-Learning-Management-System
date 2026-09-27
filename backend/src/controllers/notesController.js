const pool = require('../utils/db');
const getNotes = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      'SELECT * FROM "StudentNote" WHERE "userId"=$1 AND "sessionId"=$2 ORDER BY "videoTime" ASC',
      [req.user.id, sessionId]
    );
    res.json({ notes: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
const createNote = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { videoTime, content } = req.body;
    if (!content) return res.status(400).json({ message: 'متن یادداشت الزامی است' });
    const result = await pool.query(
      'INSERT INTO "StudentNote" ("userId", "sessionId", "videoTime", content) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, sessionId, videoTime || 0, content]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "StudentNote" WHERE id=$1 AND "userId"=$2', [id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
module.exports = { getNotes, createNote, deleteNote };
