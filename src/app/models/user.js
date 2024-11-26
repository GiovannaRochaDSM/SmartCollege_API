const bcrypt = require('bcryptjs');
const mongoose = require('../../database');
const university = require('./university');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    studentRecord: {
        type: String,
        unique: true
    },
    nickname: {
        type: String,
        unique: true,
        required: true
    },
    photo: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    authCode: {
        type: String,
        select: false,
    },
    authCodeExpires: {
        type: Date,
        select: false,
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    bond: {
        type: Boolean,
        default: false
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
    },
    isCoord: {
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

const user = mongoose.model('User', UserSchema);
module.exports = user;