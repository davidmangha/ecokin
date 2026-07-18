const express = require('express');
const referenceController = require('../controllers/referenceController');

const router = express.Router();

router.get('/communes', referenceController.listCommunes);

module.exports = router;
