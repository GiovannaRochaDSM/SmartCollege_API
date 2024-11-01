const mongoose = require('../../database');

const BondSchema = new mongoose.Schema({
    emailCoord: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
    },
    status: {
        type: String
    }
});

const bond = mongoose.model('Bond', BondSchema);
module.exports = bond;