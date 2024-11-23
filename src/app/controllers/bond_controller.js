const express = require('express');
const User = require('../models/user');
const Bond = require('../models/bond');
const mongoose = require('../../database');
const University = require('../models/university');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

// Rota GET para buscar vínculos
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('university');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        console.log('E-mail do usuário logado:', user.email);
        console.log('Universidade do usuário logado:', user.university);

        if (!user.university) {
            return res.status(400).json({ message: 'Usuário não está vinculado a uma universidade.' });
        }

        const bonds = await Bond.find({
            emailCoord: user.email,
            university: user.university._id
        })
        .populate('user')
        .populate('university');

        if (!bonds.length) {
            return res.status(404).json({ message: 'Nenhum vínculo encontrado para o usuário nesta universidade.' });
        }

        res.json(bonds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota POST para criar um novo vínculo
router.post('/', async (req, res) => {
    try {
        const { emailCoord, universityId, name } = req.body;

        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        user.name = name;
        await user.save();

        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).json({ message: 'Universidade não encontrada' });
        }

        const bond = new Bond({
            emailCoord,
            user: user._id,
            university: university._id,
        });

        const newBond = await bond.save();

        res.status(201).json(newBond);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

// Rota PUT para aceitar vínculo
router.put('/:userId/accept', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { universityId } = req.body;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }

        if (!mongoose.isValidObjectId(universityId)) {
            return res.status(400).json({ message: 'ID de universidade inválido.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).json({ message: 'Universidade não encontrada.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { bond: true, university: universityId },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const bond = await Bond.findOneAndUpdate(
            { user: userId, status: { $ne: 'concluído' } },
            { status: 'concluído', university: universityId },
            { new: true }
        );

        if (!bond) {
            return res.status(404).json({ message: 'Vínculo não encontrado ou já concluído.' });
        }

        await Bond.deleteOne({ _id: bond._id });

        return res.json({ message: 'Vínculo aceito com sucesso', user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao aceitar vínculo.' });
    }
});

// Rota PUT para rejeitar vínculo
router.put('/:userId/reject', async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { bond: false, university: null },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const bond = await Bond.findOneAndUpdate(
            { user: userId, status: { $ne: 'concluído' } },
            { status: 'concluído' },
            { new: true }
        );

        if (!bond) {
            return res.status(404).json({ message: 'Vínculo não encontrado ou já concluído.' });
        }

        await Bond.deleteOne({ _id: bond._id });

        return res.json({ message: 'Vínculo recusado com sucesso', user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao rejeitar vínculo.' });
    }
});

module.exports = app => app.use('/bond', router);
