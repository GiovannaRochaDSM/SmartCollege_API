const mongoose = require('../../database');
const user = require('./user');

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
    }
});

const Publication = mongoose.model('Publication', publicationSchema);
module.exports = Publication;
