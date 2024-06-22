const mongoose = require('../../database');
const user = require('./user.js');

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
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const publication = mongoose.model('Publication', publicationSchema);
module.exports = publication;
