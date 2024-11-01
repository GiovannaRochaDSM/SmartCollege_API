const mongoose = require('../../database');

const publicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    publication: {
        type: String,
        required: false
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        required: false
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    }
});

const publication = mongoose.model('Publication', publicationSchema);
module.exports = publication;
