const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', ctrl.getAllCategories);
router.get('/:id', ctrl.getCategory);
router.post('/', ctrl.createCategory);
router.put('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;
