const bcrypt = require('bcryptjs');
const pool = require('../utils/db');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password || !fullName)
      return res.status(400).json({ message: 'Email, password and fullName are required' });

    const exists = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (exists.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const userRole = role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';
    const isApproved = userRole === 'INSTRUCTOR' ? false : true;

    const result = await pool.query(
      'INSERT INTO "User" (email, password, "fullName", role, "isApproved") VALUES ($1, $2, $3, $4, $5) RETURNING id, email, "fullName", role, "isApproved"',
      [email, hashed, fullName, userRole, isApproved]
    );
    const user = result.rows[0];

    // اگر مدرس باشد و تأیید نشده، توکن ندهیم
    if (userRole === 'INSTRUCTOR' && !isApproved) {
      return res.status(201).json({
        message: 'ثبت‌نام موفق. درخواست شما برای مدیر ارسال شد. پس از تأیید می‌توانید وارد شوید.',
        needsApproval: true
      });
    }

    const token = generateToken(user);
    res.status(201).json({
      message: 'ثبت‌نام موفق',
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    if (user.role === 'INSTRUCTOR' && !user.isApproved) {
      return res.status(403).json({ message: 'حساب شما هنوز تأیید نشده است.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, "fullName", role, "isActive", "isApproved", "createdAt" FROM "User" WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { register, login, getProfile };
