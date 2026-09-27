const pool = require('../utils/db');

const getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, c.title, c.price, c."imageUrl", cat.name as "categoryName"
       FROM "Wishlist" w
       JOIN "Course" c ON w."courseId" = c.id
       LEFT JOIN "Category" cat ON c."categoryId" = cat.id
       WHERE w."userId"=$1`,
      [req.user.id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;
    await pool.query(
      'INSERT INTO "Wishlist" ("userId", "courseId") VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, courseId]
    );
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Already in wishlist' });
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    await pool.query('DELETE FROM "Wishlist" WHERE "userId"=$1 AND "courseId"=$2', [req.user.id, courseId]);
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
