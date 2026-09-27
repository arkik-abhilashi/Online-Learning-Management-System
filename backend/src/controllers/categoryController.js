const pool = require('../utils/db');

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Category"');
    res.json({ categories: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "Category" WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ category: result.rows[0] });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Name and slug required' });
    const result = await pool.query(
      'INSERT INTO "Category" (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    );
    res.status(201).json({ message: 'Created', category: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Name or slug exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    const result = await pool.query(
      'UPDATE "Category" SET name = COALESCE($1, name), slug = COALESCE($2, slug), description = COALESCE($3, description) WHERE id = $4 RETURNING *',
      [name, slug, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', category: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Name or slug exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM "Category" WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAllCategories, getCategory, createCategory, updateCategory, deleteCategory };
