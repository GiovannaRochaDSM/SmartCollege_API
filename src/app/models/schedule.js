const mongoose = require('../../database');
const subjects = require('./subjects.js');
const user = require('./user.js');
const bcrypt = require('bcryptjs');
 
const scheduleSchema = new mongoose.Schema({
    dayWeek: {
        type: String,
        enum: ['Segunda-feira', 'Terça-feira', 'Quarta-feira','Quinta-feira','Sexta-feira','Sábado', 'Domingo'],
        required: true
    },
    room: {
        type: String,
    },
    time: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subjects',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});
 
const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;