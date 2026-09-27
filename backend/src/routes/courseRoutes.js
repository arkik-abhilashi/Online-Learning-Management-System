const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/courseController');
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// public
router.get('/public', ctrl.getAllPublishedCourses);

// protected
router.use(authenticate);

router.post('/', upload.single('image'), ctrl.createCourse);
router.get('/my', ctrl.getMyCourses);
router.get('/:id', ctrl.getCourse);
router.put('/:id', upload.single('image'), ctrl.updateCourse);
router.delete('/:id', ctrl.deleteCourse);

module.exports = router;
