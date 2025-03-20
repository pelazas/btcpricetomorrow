const PredictionService = require('../services/predictionService');
const axios = require('axios');

exports.makePrediction = async (req, res) => {
  try {
    // Get prediction from ML microservice
    console.log("HERE!")
    const response = await axios.get('http://localhost:8001/predict');
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

    res.status(200).json(prediction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
