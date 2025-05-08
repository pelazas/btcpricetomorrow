const express = require('express');
const { addEmail, removeEmail } = require('../controllers/newsletterController');

const router = express.Router();

router.post('/add', addEmail);
router.post('/remove', removeEmail)


module.exports = router;
