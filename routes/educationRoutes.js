const express = require('express');
const educationController = require('../controllers/educationController');

const router = express.Router();

router.get('/contenus', educationController.listContents);
router.get('/campagnes', educationController.listCampaigns);

module.exports = router;
