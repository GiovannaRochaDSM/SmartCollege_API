const mongoose = require('../../database');
const bcrypt = require('bcryptjs');
 
const subjectsSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  acronym: {
    type: String,
    required: true
  },
  grades: {
    type: [Number],
    required: true
  },
  abscence: {
    type: Number,
    required: true
  }
});
 
const subjects = mongoose.model('Subjects', subjectsSchema);
module.exports = subjects;