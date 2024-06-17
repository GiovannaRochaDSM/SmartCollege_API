const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const User = require('../models/user');

router.use(authMiddleware);

// Obter dados do usuário atual
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('university');

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
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
        if (req.body.isBond != null) {
            if (req.body.isBond === true && !req.body.university) {
                return res.status(400).send({ error: 'É obrigatório informar a faculdade vinculada.' });
            }
            user.isBond = req.body.isBond;
            user.university = req.body.university;
            user.university = req.body.isBond ? req.body.university : undefined;
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