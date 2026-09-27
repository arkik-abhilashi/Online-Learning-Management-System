const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const userCtrl = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');

router.use(authenticate, authorize('ADMIN'));

// آمار
router.get('/statistics', adminCtrl.getStatistics);
router.get('/revenue/instructors', adminCtrl.getInstructorRevenue);
router.get('/logs', adminCtrl.getActivityLogs);
router.post('/notifications/global', adminCtrl.sendGlobalNotification);

// مدیریت کاربران (صفحه‌بندی شده و تأیید مدرس)
router.get('/users', userCtrl.getAllUsers);
router.get('/instructors/pending', userCtrl.getPendingInstructors);
router.patch('/users/:userId/approve', userCtrl.approveInstructor);

module.exports = router;
