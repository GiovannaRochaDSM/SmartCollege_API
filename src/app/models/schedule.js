const mongoose = require('../../database');
const User = require('./user.js'); //vinculo com a user.js
const bcrypt = require('bcryptjs');

const scheduleSchema = new mongoose.Schema({
    idSubject: {
        type: String,
        required: true
    },
    dateTime: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: user,
        required: true
    }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;