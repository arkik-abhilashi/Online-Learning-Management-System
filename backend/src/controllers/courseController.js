const pool = require('../utils/db');
const { createLog } = require('./adminController');

const createCourse = async (req, res) => {
  try {
    const { title, description, introduction, categoryId, price, level, isPublished } = req.body;
    if (!title || !description || !categoryId) return res.status(400).json({ message: 'Title, description, category required' });
    if (req.user.role === 'INSTRUCTOR' && !req.user.isApproved) return res.status(403).json({ message: 'حساب شما تأیید نشده است.' });

    let imageUrl = null;
    if (req.file) imageUrl = '/uploads/images/' + req.file.filename;
    const pub = isPublished === 'true' || isPublished === true ? true : false;

    const result = await pool.query(
      'INSERT INTO "Course" (title, description, "categoryId", "instructorId", price, level, "imageUrl", "isPublished", introduction) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [title, description, categoryId, req.user.id, parseFloat(price) || 0, level || 'BEGINNER', imageUrl, pub, introduction || '']
    );
    res.status(201).json({ course: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const getMyCourses = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, cat.name as "categoryName" FROM "Course" c LEFT JOIN "Category" cat ON c."categoryId" = cat.id WHERE c."instructorId" = $1 ORDER BY c."createdAt" DESC',
      [req.user.id]
    );
    res.json({ courses: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT c.*, cat.name as "categoryName", u."fullName" as "instructorName" FROM "Course" c LEFT JOIN "Category" cat ON c."categoryId" = cat.id LEFT JOIN "User" u ON c."instructorId" = u.id WHERE c.id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const course = result.rows[0];
    // اگر دوره منتشر شده باشد، همه می‌توانند ببینند؛ در غیر این صورت فقط مدرس یا ادمین
    if (!course.isPublished && course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json({ course });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// بقیه متدها بدون تغییر (update, delete, getAllPublishedCourses)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const courseCheck = await pool.query('SELECT * FROM "Course" WHERE id = $1', [id]);
    if (courseCheck.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    if (courseCheck.rows[0].instructorId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Forbidden' });

    const { title, description, introduction, categoryId, price, level, isPublished } = req.body;
    let imageUrl = courseCheck.rows[0].imageUrl;
    if (req.file) imageUrl = '/uploads/images/' + req.file.filename;

    let pub = courseCheck.rows[0].isPublished;
    if (isPublished !== undefined) pub = (isPublished === 'true' || isPublished === true);

    const result = await pool.query(
      `UPDATE "Course" SET title=COALESCE($1,title), description=COALESCE($2,description), introduction=COALESCE($3,introduction),
       "categoryId"=COALESCE($4,"categoryId"), price=COALESCE($5,price), level=COALESCE($6,level),
       "isPublished"=COALESCE($7,"isPublished"), "imageUrl"=$8, "updatedAt"=NOW()
       WHERE id=$9 RETURNING *`,
      [title, description, introduction, categoryId, price, level, pub, imageUrl, id]
    );
    res.json({ course: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Course" WHERE id=$1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const getAllPublishedCourses = async (req, res) => {
  try {
    const { search, category, level, minPrice, maxPrice } = req.query;
    let query = 'SELECT c.*, cat.name as "categoryName", u."fullName" as "instructorName" FROM "Course" c LEFT JOIN "Category" cat ON c."categoryId" = cat.id LEFT JOIN "User" u ON c."instructorId" = u.id WHERE c."isPublished" = true';
    const params = [];
    let idx = 1;
    if (search) { query += ` AND c.title ILIKE $${idx}`; params.push(`%${search}%`); idx++; }
    if (category) { query += ` AND c."categoryId" = $${idx}`; params.push(category); idx++; }
    if (level) { query += ` AND c.level = $${idx}`; params.push(level); idx++; }
    if (minPrice) { query += ` AND c.price >= $${idx}`; params.push(parseFloat(minPrice)); idx++; }
    if (maxPrice) { query += ` AND c.price <= $${idx}`; params.push(parseFloat(maxPrice)); idx++; }
    query += ' ORDER BY c."createdAt" DESC';
    const result = await pool.query(query, params);
    res.json({ courses: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

module.exports = { createCourse, getMyCourses, getCourse, updateCourse, deleteCourse, getAllPublishedCourses };
