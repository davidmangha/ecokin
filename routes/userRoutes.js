const express = require('express');
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../server/middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/', protect, adminOnly, userController.listUsers);
router.patch('/:id/role', protect, adminOnly, userController.updateUserRole);
router.patch('/:id/status', protect, adminOnly, userController.updateUserStatus);

module.exports = router;
