const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    studentRecord: {
        type: String,
        unique: true
    },
    nickname: {
        type: String,
        unique: true
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
    passwordResetToken: {
        type: String, 
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    bond: {
        type: Boolean,
        default: false
    },
    isCoord: {
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

const user = mongoose.model('User', UserSchema);
module.exports = user;