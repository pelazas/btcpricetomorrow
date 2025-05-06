const PredictionService = require('../services/predictionService');
const axios = require('axios');

exports.makePrediction = async (req, res) => {
  try {
    // Get prediction from ML microservice
    console.log("ML URI", process.env.ML_URI)
    const response = await axios.get(`${process.env.ML_URI}/predict`);
    console.log(response.data)
    const predictedValue = response.data.next_day_prediction;

    // Call PredictionService to store the prediction
    const prediction = await PredictionService.createPrediction(predictedValue);

    res.status(201).json(prediction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPrediction = async (req, res) => {
  try {
    // Get today's prediction from PredictionService
    const prediction = await PredictionService.getTodaysPrediction();

    if (!prediction) {
      return res.status(404).json({ message: 'No prediction found for today' });
    }
    // update prices
    await PredictionService.updateActualPrices();
    const today_price = await PredictionService.getTodaysPrice();

    const predictions = await PredictionService.get30daysPredictions();

    const response = {
      prediction,
      today_price,
      predictions
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
