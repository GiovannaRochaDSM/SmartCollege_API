const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Bond = require('../models/bond');
const University = require('../models/university');
const User = require('../models/user');
const mongoose = require('mongoose');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const bonds = await Bond.find()
            .populate('user')
            .populate('university');

        res.json(bonds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { emailCoord, userId, universityId } = req.body;

        if (!emailCoord || !userId || !universityId) {
            return res.status(400).json({ message: "emailCoord, userId and universityId são obrigatórios" });
        }

        const bond = new Bond({
            emailCoord,
            user: userId,
            university: universityId
        });

        const newBond = await bond.save();

        req.universityId = universityId;

        res.status(201).json(newBond);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

router.put('/:userId/accept', async (req, res) => {
    try {
        const userId = req.params.userId;
        const universityId = req.body.universityId;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: 'userId inválido' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { isBond: true, university: universityId }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const bond = await Bond.findOneAndUpdate(
            { user: userId, status: { $ne: 'concluído' } },
            { status: 'concluído', university: universityId },
            { new: true }
        );

        if (!bond) {
            return res.status(404).json({ message: 'Vínculo não encontrado ou já concluído' });
        }

        await Bond.deleteOne({ _id: bond._id });
        res.json({ message: 'Vínculo aceito com sucesso', bond });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:userId/reject', async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: 'userId inválido' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { isBond: false, university: null }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const bond = await Bond.findOneAndUpdate(
            { user: userId, status: { $ne: 'concluído' } },
            { status: 'concluído' },
            { new: true }
        );

        if (!bond) {
            return res.status(404).json({ message: 'Vínculo não encontrado ou já concluído' });
        }

        await Bond.deleteOne({ _id: bond._id });

        updatedUser.university = undefined;

        res.json({ message: 'Vínculo recusado com sucesso', user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = app => app.use('/bond', router);