const pool = require('../utils/db');

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE "Notification" SET read = true WHERE id = $1', [id]);
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE "Notification" SET read = true WHERE "userId" = $1 AND read = false',
      [req.user.id]
    );
    res.json({ message: 'All marked read' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
