const mongoose = require('../../database');
const user = require('./user.js');//vinculo com model user
const bcrypt = require('bcryptjs');

const publicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        required: true
    },
     // vinculo com a model User
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: user,
        required: true
    }
});

const publication = mongoose.model('Publication', publicationSchema);
module.exports = publication;
