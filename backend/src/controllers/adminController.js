const pool = require('../utils/db');

// آمار کلی
const getStatistics = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int FROM "User"');
    const coursesCount = await pool.query('SELECT COUNT(*)::int FROM "Course"');
    const enrollmentsCount = await pool.query('SELECT COUNT(*)::int FROM "Enrollment"');
    const revenue = await pool.query(
      'SELECT COALESCE(SUM(c.price), 0)::float FROM "Enrollment" e JOIN "Course" c ON e."courseId" = c.id'
    );
    res.json({
      totalUsers: usersCount.rows[0].count,
      totalCourses: coursesCount.rows[0].count,
      totalEnrollments: enrollmentsCount.rows[0].count,
      totalRevenue: revenue.rows[0].coalesce
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// درآمد هر مدرس
const getInstructorRevenue = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u."fullName", u.email,
        COALESCE(SUM(c.price), 0)::float as revenue,
        COUNT(DISTINCT e.id) as enrollments
      FROM "User" u
      LEFT JOIN "Course" c ON c."instructorId" = u.id
      LEFT JOIN "Enrollment" e ON e."courseId" = c.id
      WHERE u.role = 'INSTRUCTOR'
      GROUP BY u.id
      ORDER BY revenue DESC
    `);
    res.json({ instructors: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// لاگ فعالیت‌ها (با صفحه‌بندی)
const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*)::int FROM "ActivityLog"');
    const total = countResult.rows[0].count;

    const logs = await pool.query(
      'SELECT al.*, u."fullName" as "userName" FROM "ActivityLog" al LEFT JOIN "User" u ON al."userId" = u.id ORDER BY al."createdAt" DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      logs: logs.rows,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ذخیره لاگ (از کنترلر‌های دیگر صدا زده می‌شود)
const createLog = async (userId, action, details = {}) => {
  try {
    await pool.query(
      'INSERT INTO "ActivityLog" ("userId", action, details) VALUES ($1, $2, $3)',
      [userId, action, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

// اعلان سراسری
const sendGlobalNotification = async (req, res) => {
  try {
    const { message, roles } = req.body; // roles: ['STUDENT', 'INSTRUCTOR'] or omitted for all
    if (!message) return res.status(400).json({ message: 'متن اعلان الزامی است' });

    let users;
    if (roles && roles.length > 0) {
      users = await pool.query(
        'SELECT id FROM "User" WHERE role = ANY($1)',
        [roles]
      );
    } else {
      users = await pool.query('SELECT id FROM "User"');
    }

    const io = require('../socket').getIO();
    const { createNotification } = require('../services/notificationService');

    for (const u of users.rows) {
      const notif = await createNotification(u.id, message, 'GLOBAL', null);
      io.to(`user:${u.id}`).emit('notification', notif);
    }

    res.json({ message: 'اعلان ارسال شد', recipients: users.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStatistics, getInstructorRevenue, getActivityLogs, sendGlobalNotification, createLog };
