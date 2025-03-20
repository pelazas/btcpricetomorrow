const Prediction = require('../models/Prediction');

exports.createPrediction = async (next_day_prediction) => {
  return await Prediction.create({ next_day_prediction });
};

exports.getTodaysPrediction = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await Prediction.findOne({
    date: { $gte: today },
  }).sort({ date: -1 });
};
