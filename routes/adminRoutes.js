const express = require('express');
const adminController = require('../controllers/adminController');
const signalementController = require('../controllers/signalementController');
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../server/middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/overview', adminController.overview);
router.get('/users', userController.listUsers);
router.patch('/users/:id/role', userController.updateUserRole);
router.patch('/users/:id/status', userController.updateUserStatus);
router.get('/signalements', signalementController.listSignalements);
router.patch('/signalements/:id/status', signalementController.updateStatus);
router.delete('/signalements/:id', signalementController.removeSignalement);

module.exports = router;
