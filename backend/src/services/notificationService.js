const pool = require('../utils/db');

const createNotification = async (userId, message, type, referenceId = null) => {
  const result = await pool.query(
    'INSERT INTO "Notification" ("userId", message, type, "referenceId") VALUES ($1,$2,$3,$4) RETURNING *',
    [userId, message, type, referenceId]
  );
  return result.rows[0];
};

const notifyUsersByCourse = async (courseId, message, type, io, referenceId = null) => {
  const enrollments = await pool.query(
    'SELECT "userId" FROM "Enrollment" WHERE "courseId" = $1',
    [courseId]
  );
  for (const enr of enrollments.rows) {
    const notif = await createNotification(enr.userId, message, type, referenceId);
    io.to(`user:${enr.userId}`).emit('notification', notif);
  }
};

module.exports = { createNotification, notifyUsersByCourse };
