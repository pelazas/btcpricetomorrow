const express = require('express');
const { addEmail } = require('../controllers/newsletterController');

const router = express.Router();

router.post('/add', addEmail);


module.exports = router;
