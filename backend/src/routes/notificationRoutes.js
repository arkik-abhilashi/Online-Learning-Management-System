const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

router.get('/', ctrl.getNotifications);
router.patch('/:id/read', ctrl.markAsRead);
router.patch('/read-all', ctrl.markAllAsRead);

module.exports = router;
