const express = require('express');
const { makePrediction, getPrediction } = require('../controllers/predictionController');

const router = express.Router();

router.get('/makePrediction', makePrediction);
router.get('/getPrediction', getPrediction);

module.exports = router;
