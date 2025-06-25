const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  pocketId: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Income', incomeSchema);
