const express = require('express');
const { addVote, getVotesToday } = require('../controllers/voteController');

const router = express.Router();

router.post('/addVote', addVote);
router.get('/getVotes', getVotesToday)

module.exports = router;
