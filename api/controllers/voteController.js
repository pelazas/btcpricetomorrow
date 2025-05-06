const Vote = require('../models/Vote');

exports.addVote = async (req, res) => {
    try {
        // Create new vote document
        const vote = new Vote({
            upVote: req.body.vote === 'up'
        });

        // Save the vote to database
        await vote.save();

        res.status(201).json({
            success: true,
            data: vote
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error creating vote: ' + error.message
        });
    }
}

exports.getVotesToday = async (req, res) => {
    try {
        // Get start of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Delete votes that are not from today
        await Vote.deleteMany({
            date: {
                $lt: startOfDay
            }
        });

        // Count upvotes and downvotes
        const upvotes = await Vote.countDocuments({ upVote: true });
        const downvotes = await Vote.countDocuments({ upVote: false });

        res.status(200).json({
            success: true,
            upvotes,
            downvotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching votes: ' + error.message
        });
    }
}