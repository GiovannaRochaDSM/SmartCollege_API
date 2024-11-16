const mongoose = require('../../database');
const user = require('./user.js');
 
const subjectsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  acronym: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});
 
const subjects = mongoose.model('Subjects', subjectsSchema);
module.exports = subjects;