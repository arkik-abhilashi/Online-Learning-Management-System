const express = require('express');
const router = express.Router();
const { getAllUsers, changeRole, toggleActive, deleteUser } = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');

router.use(authenticate);            // all routes require token
router.use(authorize('ADMIN'));      // only admin

router.get('/', getAllUsers);
router.patch('/:userId/role', changeRole);
router.patch('/:userId/toggle-active', toggleActive);
router.delete('/:userId', deleteUser);

module.exports = router;
