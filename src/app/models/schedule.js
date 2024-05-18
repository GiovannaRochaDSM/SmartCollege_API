const mongoose = require('../../database');
const subjects = require('./subjects.js');
const bcrypt = require('bcryptjs');

const scheduleSchema = new mongoose.Schema({
    dayWeek: {
        type: String,
        enum: ['Segunda-feira', 'Terça-feira', 'Quarta-feira','Quinta-feira','Sexta-feira','Sábado', 'Domingo'],
        required: true
    },
    room: {
        type: String,
        required: true
    },
    subjects: {
        type: mongoose.Schema.Types.ObjectId,
        ref: subjects,
        required: true
    }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;