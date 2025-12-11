const Prediction = require('../models/Prediction');
const axios = require('axios');

exports.createPrediction = async (next_day_prediction) => {
  return await Prediction.create({ next_day_prediction });
};

exports.getTodaysPrediction = async () => {
  return await Prediction.findOne().sort({ date: -1 });
};

exports.getTodaysPrice = async () => {
  try {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}`);
    return response.data.market_data.current_price.usd;
  } catch(error) {
    console.error('Error fetching today\'s price:', error.message);
    throw error;
  }
}

exports.updateActualPrices = async () => {
  try {

    const today = new Date();
    today.setHours(0,0,0,0)

    const predictions = await Prediction.find({ 
      actual_price: { $exists: false },
      date: { $lt: today }
    }).sort({ date: -1 }).limit(30);

    for (const prediction of predictions) {
        const date = new Date(prediction.date);
        date.setDate(date.getDate() +1)
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}`);
            
            prediction.actual_price = response.data.market_data.current_price.usd;
            await prediction.save();
            await sleep(1000);
        } catch (error) {
            console.error(`Error fetching price for date ${formattedDate}:`, error.message);
            continue; 
        }
    }

    
} catch (error) {
    console.error('Error updating actual prices:', error);
}
}

exports.get30daysPredictions = async () => {
  try{
    const today = new Date();
    today.setHours(0,0,0,0)

    const predictions = await Prediction.find({ 
      date: { $lt: today }
    }).sort({ date: -1 }).limit(30);

    return predictions
  } catch(error){
    console.error('Error getting predictions')
  }
  
}
