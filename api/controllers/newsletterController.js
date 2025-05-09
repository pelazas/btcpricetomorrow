const { getValidToken } = require('../config/oauth');
const axios = require('axios')
const Email = require('../models/Email');
const { getTodaysPrediction, getTodaysPrice } = require('../services/predictionService');


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

exports.removeEmail = async(req,res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Find and remove the email
        const deletedEmail = await Email.findOneAndDelete({ email });
        
        if (!deletedEmail) {
            return res.status(404).json({
                success: false,
                error: 'Email is not in the database'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error unsubscribing from newsletter: ' + error.message
        });
    }
};

// Usage example in a tweet route
exports.createPost = async (req, res) => {
    try {
      const accessToken = await getValidToken();

      // get price prediction
      const pricePrediction = await getTodaysPrediction();
      // get formatted date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.getDate() + ' ' + tomorrow.toLocaleString('default', { month: 'long' });
      // get actual price 
      const actualPrice = await getTodaysPrice();
      // calculate difference
      const priceDifference = pricePrediction.next_day_prediction - actualPrice;
      const percentageDifference = ((priceDifference / actualPrice) * 100).toFixed(2);
      
      const tweetText = `Bitcoin Price Prediction for ${formattedDate}:\n\n` +
        `Predicted Price: $${pricePrediction.next_day_prediction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n` +
        `Current Price: $${actualPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n` +
        `Difference: ${priceDifference < 0 ? '-' : ''}${Math.abs(percentageDifference)}%`;

      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text: tweetText },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      res.json(response.data);
    } catch (error) {
      console.error('Tweet error:', error);
      res.status(500).json({ error: 'Tweet failed' });
    }
};