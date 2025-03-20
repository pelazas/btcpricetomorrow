const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  next_day_prediction: { type: Number, required: true },
  actual_price: { type: Number, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Prediction', PredictionSchema);
