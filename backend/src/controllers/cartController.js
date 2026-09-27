const pool = require('../utils/db');

const getCart = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.*, c.title, c.price, c."imageUrl"
       FROM "CartItem" ci JOIN "Course" c ON ci."courseId" = c.id
       WHERE ci."userId"=$1`,
      [req.user.id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    await pool.query(
      'INSERT INTO "CartItem" ("userId", "courseId") VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, courseId]
    );
    res.json({ message: 'Added to cart' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Already in cart' });
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    await pool.query('DELETE FROM "CartItem" WHERE "userId"=$1 AND "courseId"=$2', [req.user.id, courseId]);
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const checkout = async (req, res) => {
  // در یک سیستم واقعی پردازش پرداخت انجام می‌شود، اینجا فقط ثبت‌نام می‌کنیم
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cartItems = await client.query('SELECT * FROM "CartItem" WHERE "userId"=$1', [req.user.id]);
    for (const item of cartItems.rows) {
      // ثبت‌نام (در صورت عدم وجود قبلی)
      await client.query(
        'INSERT INTO "Enrollment" ("userId", "courseId") VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [req.user.id, item.courseId]
      );
    }
    // خالی کردن سبد
    await client.query('DELETE FROM "CartItem" WHERE "userId"=$1', [req.user.id]);
    await client.query('COMMIT');
    res.json({ message: 'خرید موفق - در دوره‌ها ثبت‌نام شدید' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = { getCart, addToCart, removeFromCart, checkout };
