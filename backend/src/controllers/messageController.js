const pool = require('../utils/db');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, courseId, content } = req.body;
    if (!receiverId || !courseId || !content) return res.status(400).json({ message: 'اطلاعات ناقص است' });

    const course = await pool.query('SELECT * FROM "Course" WHERE id=$1', [courseId]);
    if (course.rows.length===0 || (course.rows[0].instructorId !== req.user.id && req.user.role !== 'ADMIN'))
      return res.status(403).json({ message: 'Forbidden' });

    const result = await pool.query(
      'INSERT INTO "Message" ("senderId", "receiverId", "courseId", content) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, receiverId, courseId, content]
    );

    // اعلان با نمایش محتوای پیام (حداکثر ۱۰۰ کاراکتر)
    const notifText = `پیام جدید: «${content.length > 100 ? content.substring(0,100)+'…' : content}»`;
    const { createNotification } = require('../services/notificationService');
    const io = require('../socket').getIO();
    const notif = await createNotification(receiverId, notifText, 'MESSAGE', result.rows[0].id);
    io.to(`user:${receiverId}`).emit('notification', notif);

    res.status(201).json({ message: 'پیام ارسال شد', data: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT m.*,
              s."fullName" AS "senderName",
              r."fullName" AS "receiverName"
       FROM "Message" m
       LEFT JOIN "User" s ON m."senderId" = s.id
       LEFT JOIN "User" r ON m."receiverId" = r.id
       WHERE m."senderId" = $1 OR m."receiverId" = $1
       ORDER BY m."createdAt" DESC`,
      [userId]
    );
    res.json({ messages: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE "Message" SET read=true WHERE id=$1 AND "receiverId"=$2', [id, req.user.id]);
    res.json({ message: 'Marked read' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { sendMessage, getMessages, markRead };
