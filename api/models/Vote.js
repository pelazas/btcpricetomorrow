const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  upVote: {type: Boolean, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Vote', VoteSchema);
