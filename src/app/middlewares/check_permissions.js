const User = require('../models/user');

async function checkBond(req, res, next) {
    try {
        const user = await User.findById(req.userId).populate('university');
        if (!user || !user.bond || !user.university) {
            return res.status(403).json({ message: 'Acesso negado. Você não possui vínculo com uma universidade.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function checkCoord(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.isCoord) {
            return res.status(403).json({ message: 'Acesso negado. Somente coordenadores têm permissão.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { checkBond, checkCoord };