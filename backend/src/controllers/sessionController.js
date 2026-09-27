const pool = require('../utils/db');

const getSessions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query('SELECT * FROM "Session" WHERE "courseId"=$1 ORDER BY "order" ASC', [courseId]);
    res.json({ sessions: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await pool.query('SELECT * FROM "Session" WHERE id=$1', [id]);
    if (session.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const attachments = await pool.query('SELECT * FROM "Attachment" WHERE "sessionId"=$1', [id]);
    res.json({ session: session.rows[0], attachments: attachments.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const createSession = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await pool.query('SELECT * FROM "Course" WHERE id=$1', [courseId]);
    if (course.rows.length === 0 || course.rows[0].instructorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, videoUrl, order } = req.body;
    let videoPath = videoUrl || null;
    if (req.file) videoPath = '/uploads/videos/' + req.file.filename;

    const result = await pool.query(
      'INSERT INTO "Session" ("courseId", title, description, "videoUrl", "order") VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [courseId, title, description, videoPath, parseInt(order) || 0]
    );
    res.status(201).json({ session: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const updateSession = async (req, res) => { /* keep simple */ };
const deleteSession = async (req, res) => { /* keep simple */ };
const addAttachments = async (req, res) => { /* keep */ };
const deleteAttachment = async (req, res) => { /* keep */ };

module.exports = { getSessions, getSession, createSession, updateSession, deleteSession, addAttachments, deleteAttachment };
