const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/instructorController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');

router.use(authenticate, authorize('INSTRUCTOR'));

router.get('/stats', ctrl.getMyStats);
router.get('/courses/:courseId/students', ctrl.getCourseStudents);
router.get('/courses/:courseId/students/:studentId', ctrl.getStudentDetail);
router.get('/quizzes/:quizId/stats', ctrl.getQuizQuestionStats);

module.exports = router;
