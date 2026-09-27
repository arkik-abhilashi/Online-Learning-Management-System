const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/certificateController');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

router.post('/issue', ctrl.issueCertificate); // instructor/admin
router.get('/my', ctrl.getMyCertificates); // student

module.exports = router;
