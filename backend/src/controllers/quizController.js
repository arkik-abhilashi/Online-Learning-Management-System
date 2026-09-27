const pool = require('../utils/db');

// دریافت همه آزمون‌های یک جلسه
const getQuizzes = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query('SELECT * FROM "Quiz" WHERE "sessionId" = $1', [sessionId]);
    res.json({ quizzes: result.rows });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// دریافت یک آزمون خاص با سوالات و گزینه‌ها
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;  // اصلاح شد (قبلاً quizId بود)
    const quiz = await pool.query('SELECT * FROM "Quiz" WHERE id = $1', [id]);
    if (quiz.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    // دریافت سوالات این آزمون به ترتیب order
    const questions = await pool.query(
      'SELECT * FROM "Question" WHERE "quizId" = $1 ORDER BY "order" ASC',
      [id]
    );
    // برای هر سوال، گزینه‌ها را بگیریم
    const questionsWithOptions = [];
    for (const q of questions.rows) {
      const options = await pool.query(
        'SELECT * FROM "Option" WHERE "questionId" = $1',
        [q.id]
      );
      questionsWithOptions.push({
        ...q,
        options: options.rows
      });
    }

    res.json({ quiz: quiz.rows[0], questions: questionsWithOptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createQuiz = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { sessionId } = req.params;
    const session = await client.query('SELECT * FROM "Session" WHERE id = $1', [sessionId]);
    const course = await client.query('SELECT * FROM "Course" WHERE id = $1', [session.rows[0].courseId]);
    if (course.rows[0].instructorId !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, description, questions } = req.body;
    const quizResult = await client.query(
      'INSERT INTO "Quiz" ("sessionId", title, description) VALUES ($1,$2,$3) RETURNING *',
      [sessionId, title, description]
    );
    const quiz = quizResult.rows[0];

    for (const q of questions) {
      const qResult = await client.query(
        'INSERT INTO "Question" ("quizId", text, "order", marks) VALUES ($1,$2,$3,$4) RETURNING *',
        [quiz.id, q.text, q.order || 0, q.marks || 1]
      );
      for (const opt of q.options) {
        await client.query(
          'INSERT INTO "Option" ("questionId", text, "isCorrect") VALUES ($1,$2,$3)',
          [qResult.rows[0].id, opt.text, opt.isCorrect || false]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ quiz });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const updateQuiz = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const quiz = await client.query('SELECT * FROM "Quiz" WHERE id = $1', [id]);
    if (quiz.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Not found' }); }
    const session = await client.query('SELECT * FROM "Session" WHERE id = $1', [quiz.rows[0].sessionId]);
    const course = await client.query('SELECT * FROM "Course" WHERE id = $1', [session.rows[0].courseId]);
    if (course.rows[0].instructorId !== req.user.id) { await client.query('ROLLBACK'); return res.status(403).json({ message: 'Forbidden' }); }

    const { title, description, questions } = req.body;
    await client.query('UPDATE "Quiz" SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3',
      [title, description, id]);

    // Replace questions
    await client.query('DELETE FROM "Question" WHERE "quizId" = $1', [id]);
    for (const q of questions) {
      const qResult = await client.query(
        'INSERT INTO "Question" ("quizId", text, "order", marks) VALUES ($1,$2,$3,$4) RETURNING *',
        [id, q.text, q.order || 0, q.marks || 1]
      );
      for (const opt of q.options) {
        await client.query('INSERT INTO "Option" ("questionId", text, "isCorrect") VALUES ($1,$2,$3)',
          [qResult.rows[0].id, opt.text, opt.isCorrect || false]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Quiz" WHERE id = $1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz };
