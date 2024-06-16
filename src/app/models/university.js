const mongoose = require('../../database');

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    degreeCourse: {
        type: [String],
        required: true
    }
});

const university = mongoose.model('University', universitySchema);
module.exports = university;
