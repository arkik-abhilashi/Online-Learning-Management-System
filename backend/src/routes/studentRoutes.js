const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollmentController');
const progressCtrl = require('../controllers/studentProgressController');
const certCtrl = require('../controllers/certificateController');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

// enroll & enrollments
router.post('/enroll/:courseId', ctrl.enroll);
router.get('/enrollments', ctrl.getMyEnrollments);
router.get('/courses/:courseId/learn', ctrl.getCourseLearning);

// quiz
router.post('/quizzes/:quizId/submit', ctrl.submitQuiz);
router.get('/quizzes/:quizId/attempts', ctrl.getQuizAttempts);

// progress (new)
router.patch('/sessions/:sessionId/complete', progressCtrl.markSessionCompleted);
router.get('/courses/:courseId/progress', progressCtrl.getCourseProgress);

// certificate self-service
router.post('/courses/:courseId/generate-certificate', certCtrl.generateCertificateForStudent);

module.exports = router;
