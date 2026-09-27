const pool = require('../utils/db');
const { createLog } = require('./adminController');

// دریافت کاربران با صفحه‌بندی
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*)::int FROM "User"');
    const total = countResult.rows[0].count;

    const users = await pool.query(
      'SELECT id, email, "fullName", role, "isActive", "isApproved", "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      users: users.rows,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// دریافت مدرسان تأیید نشده
const getPendingInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, "fullName", "createdAt" FROM "User" WHERE role = $1 AND "isApproved" = false',
      ['INSTRUCTOR']
    );
    res.json({ instructors: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// تأیید مدرس
const approveInstructor = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'UPDATE "User" SET "isApproved" = true WHERE id = $1 AND role = $2 RETURNING id, email, "fullName"',
      [userId, 'INSTRUCTOR']
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found or not instructor' });

    // لاگ
    await createLog(req.user.id, 'APPROVE_INSTRUCTOR', { instructorId: userId });

    res.json({ message: 'مدرس تأیید شد', instructor: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changeRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'INSTRUCTOR', 'STUDENT'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const result = await pool.query(
      'UPDATE "User" SET role = $1 WHERE id = $2 RETURNING id, email, "fullName", role',
      [role, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    // اگر نقش INSTRUCTOR می‌شود، تأیید خودکار (چون ادمین تغییر می‌دهد) وگرنه نیاز به تأیید جداگانه دارد؟
    // منطق: اگر ادمین دستی تغییر نقش دهد، تأییدشده است.
    if (role === 'INSTRUCTOR') {
      await pool.query('UPDATE "User" SET "isApproved" = true WHERE id = $1', [userId]);
    }

    await createLog(req.user.id, 'CHANGE_ROLE', { targetUserId: userId, newRole: role });
    res.json({ message: 'Role updated', user: result.rows[0] });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const toggleActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'UPDATE "User" SET "isActive" = NOT "isActive" WHERE id = $1 RETURNING id, email, "isActive"',
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const u = result.rows[0];
    await createLog(req.user.id, 'TOGGLE_ACTIVE', { targetUserId: userId, newStatus: u.isActive });
    res.json({ message: `User ${u.isActive ? 'activated' : 'deactivated'}`, user: u });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // دریافت اطلاعات کاربر برای لاگ
    const userToDelete = await pool.query('SELECT id, email, role FROM "User" WHERE id = $1', [userId]);
    if (userToDelete.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    await pool.query('DELETE FROM "User" WHERE id = $1', [userId]);
    await createLog(req.user.id, 'DELETE_USER', { deletedUserId: userId, email: userToDelete.rows[0].email });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAllUsers, getPendingInstructors, approveInstructor, changeRole, toggleActive, deleteUser };
