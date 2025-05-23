const express = require('express');
const { addEmail, removeEmail, createPost } = require('../controllers/newsletterController');

const router = express.Router();

router.post('/add', addEmail);
router.post('/remove', removeEmail)
router.get('/createPost', createPost)


module.exports = router;
