const express = require('express');
const { getModel } = require('../controllers/modelController');

const router = express.Router();

router.get('/getModel', getModel);

module.exports = router;
