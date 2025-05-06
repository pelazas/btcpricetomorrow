const Prediction = require('../models/Prediction');
const axios = require('axios');

exports.updateActualPrice = async (req, res) => {
    try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const predictions = await Prediction.find({ 
            actual_price: { $exists: false },
            date: { $lt: today }  // Only get predictions before today
        })
            .sort({ date: -1 })
            .limit(30);

        for (const prediction of predictions) {
            // Add one day to the prediction date
            const date = new Date(prediction.date);
            date.setDate(date.getDate() + 1);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

            try {
                const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}`);
                
                prediction.actual_price = response.data.market_data.current_price.usd;
                await prediction.save();
            } catch (error) {
                console.error(`Error fetching price for date ${formattedDate}:`, error.message);
                continue; 
            }
        }

        res.status(200).json({ message: `${predictions.length} items modified` });
    } catch (error) {
        console.error('Error updating actual prices:', error);
        res.status(500).json({ error: 'Failed to update actual prices' });
    }
}