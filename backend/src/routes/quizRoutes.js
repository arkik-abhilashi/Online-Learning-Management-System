const express = require('express');
const router = express.Router({ mergeParams: true }); // sessionId
const ctrl = require('../controllers/quizController');
const authenticate = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getQuizzes);
router.get('/:id', ctrl.getQuizById);  // <-- جدید
router.post('/', ctrl.createQuiz);
router.put('/:id', ctrl.updateQuiz);
router.delete('/:id', ctrl.deleteQuiz);

module.exports = router;
