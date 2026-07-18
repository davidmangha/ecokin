const express = require('express');
const signalementController = require('../controllers/signalementController');
const { protect, adminOnly } = require('../server/middleware/authMiddleware');
const upload = require('../server/middleware/uploadMiddleware');

const router = express.Router();

router.get('/', signalementController.listSignalements);
router.get('/:id', signalementController.getSignalement);
router.post('/', protect, upload.single('photo'), signalementController.createSignalement);
router.patch('/:id/status', protect, adminOnly, signalementController.updateStatus);
router.delete('/:id', protect, adminOnly, signalementController.removeSignalement);

module.exports = router;
