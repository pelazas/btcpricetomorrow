const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    email: { type: String, required: true },
});

module.exports = mongoose.model('Email', EmailSchema);