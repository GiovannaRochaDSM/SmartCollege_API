const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Notification = require('../models/notification');
const Task = require('../models/task');

router.use(authMiddleware);

// Rota para obter todas as notificações do usuário atual
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.userId });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para criar uma notificação
router.post('/', async (req, res) => {
    const { title, body, taskId } = req.body; 
    try {
        const notification = new Notification({
            title,
            body,
            taskId,
            userId: req.userId 
        });

        const newNotification = await notification.save();
        res.status(201).json(newNotification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Rota para excluir uma notificação por ID
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notificação não encontrada' });
        }
        if (notification.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        await notification.deleteOne();
        res.json({ message: 'Notificação excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = app => app.use('/notifications', router);