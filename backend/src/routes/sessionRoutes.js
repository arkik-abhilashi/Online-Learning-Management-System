const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/sessionController');
const authenticate = require('../middlewares/auth');
const uploadVideo = require('../middlewares/uploadVideo');
const uploadAttachment = require('../middlewares/uploadAttachment');

router.use(authenticate);

router.get('/', ctrl.getSessions);
router.get('/:id', ctrl.getSession);
router.post('/', uploadVideo.single('video'), ctrl.createSession);
router.put('/:id', uploadVideo.single('video'), ctrl.updateSession);
router.delete('/:id', ctrl.deleteSession);
// تغییر: قبلاً تک فایل بود، حالا چند فایل
router.post('/:sessionId/attachments', uploadAttachment.array('files', 10), ctrl.addAttachments);
router.delete('/attachments/:id', ctrl.deleteAttachment);

module.exports = router;
