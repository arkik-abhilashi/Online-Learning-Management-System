const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// دریافت تمام دسته‌بندی‌ها
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, slug, description FROM "Category" ORDER BY name');
    res.json({ categories: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// دریافت جزئیات یک دوره منتشرشده (عمومی)
router.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, cat.name as "categoryName", u."fullName" as "instructorName"
       FROM "Course" c
       LEFT JOIN "Category" cat ON c."categoryId" = cat.id
       LEFT JOIN "User" u ON c."instructorId" = u.id
       WHERE c.id = $1 AND c."isPublished" = true`,  // فقط دوره‌های منتشرشده
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'دوره یافت نشد' });
    res.json({ course: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
