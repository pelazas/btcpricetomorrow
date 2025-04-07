const mongoose = require('mongoose');

const ModelSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    name: { type: String, required: true },
    MAE: { type: Number, required: true },
    RMSE: { type: Number, required: true },
    directionAccuracy: { type: String, required: true }
});

module.exports = mongoose.model('Model', ModelSchema);