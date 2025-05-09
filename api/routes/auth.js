const express = require('express');
const { OAuth, OAuthCallback } = require('../controllers/authController');

const router = express.Router();

router.get('/', OAuth);
router.get('/callback', OAuthCallback)

module.exports = router;