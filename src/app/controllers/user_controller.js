const authMiddleware = require('../middlewares/auth');
const User = require('../models/user');
const university = require('../models/university');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.use(authMiddleware);

// Obter dados do usuário atual
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('university');
        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });
        const userData = {
            name: user.name,
            nickname: user.nickname,
            photo: user.photo,
            email: user.email,
            bond: user.bond,
            university: user.bond ? user.university : null,
            isCoord: user.isCoord
        };

        res.send(userData);
    } catch (err) {
        res.status(400).send({ error: 'Erro ao buscar dados do usuário' });
    }
});

// Atualizar usuário atual
router.put('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        if (req.body.name != null) {
            user.name = req.body.name;
        }
        if (req.body.nickname != null) {
            user.nickname = req.body.nickname;
        }
        if (req.body.photo != null) {
            user.photo = req.body.photo;
        }
        if (req.body.email != null) {
            user.email = req.body.email;
        }
        if (req.body.bond != false) {
            if (req.body.bond === true && !req.body.university) {
                return res.status(400).send({ error: 'É obrigatório informar a universidade ao vincular.' });
            }
            user.bond = req.body.bond;
            user.university = req.body.bond ? req.body.university : null;
        }
        if (req.body.isCoord != null) {
            user.isCoord = req.body.isCoord;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(400).json({ message: err.message });
    }
});

// Excluir conta usuário atual
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        await User.findByIdAndRemove(userId);
        res.send({ message: 'Conta excluída com sucesso' });
    } catch (err) {
        res.status(400).send({ error: 'Erro ao excluir conta do usuário' });
    }
});

module.exports = app => app.use('/me', router);