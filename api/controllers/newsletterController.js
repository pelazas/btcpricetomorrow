const Email = require('../models/Email');

exports.addEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Check if email already exists
        const existingEmail = await Email.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: 'Email already subscribed'
            });
        }

        // Create new email subscription
        const newEmail = new Email({ email });
        await newEmail.save();

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error subscribing to newsletter: ' + error.message
        });
    }
};
