const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messageController');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

router.post('/send', ctrl.sendMessage); // مدرس/ادمین
router.get('/', ctrl.getMessages);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;
