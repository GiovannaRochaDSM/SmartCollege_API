const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Task = require('../models/task');
const Notification = require('../models/notification');

router.use(authMiddleware);

// Rota para obter todas as tarefas do usuário atual
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId }).populate('subject');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter uma tarefa por ID
router.get('/:id', getTaskById, (req, res) => {
    try {
        if (res.task.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        res.json(res.task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para criar uma tarefa
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        if (await Task.findOne({ name, user: req.userId })) {
            return res.status(400).json({ message: 'Tarefa já cadastrada!' });
        }

        const task = new Task({
            name: req.body.name,
            description: req.body.description,
            priority: req.body.priority,
            deadline: req.body.deadline,
            status: req.body.status,
            subject: req.body.subject,
            category: req.body.category,
            user: req.userId
        });

        const newTask = await task.save();

        if (task.status !== 'Concluída') {
            const notificationPromises = [];

            // Notificação para o dia do vencimento
            notificationPromises.push(new Notification({
                title: 'Tarefa Vencendo Hoje',
                body: `A ${newTask.category} "${newTask.name}" vence hoje.`,
                taskId: newTask._id,
                userId: req.userId,
                scheduledTime: newTask.deadline,
            }).save());

            // Notificação para 5 dias antes do vencimento
            const fiveDaysBefore = new Date(newTask.deadline);
            fiveDaysBefore.setDate(fiveDaysBefore.getDate() + 3);
            notificationPromises.push(new Notification({
                title: 'Tarefa Vencendo em 3 Dias',
                body: `Você tem uma  ${newTask.category} "${newTask.name}" vencendo em 3 dias.`,
                taskId: newTask._id,
                userId: req.userId,
                scheduledTime: fiveDaysBefore,
            }).save());

            await Promise.all(notificationPromises);
        }
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para atualizar uma tarefa por ID
router.put('/:id', getTaskById, async (req, res) => {
    try {
        if (res.task.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        if (req.body.name != null) {
            res.task.name = req.body.name;
        }
        if (req.body.description != null) {
            res.task.description = req.body.description;
        }
        if (req.body.priority != null) {
            res.task.priority = req.body.priority;
        }
        if (req.body.deadline != null) {
            res.task.deadline = req.body.deadline;
        }
        if (req.body.status != null) {
            res.task.status = req.body.status;
        }
        if (req.body.subject != null) {
            res.task.subject = req.body.subject;
        }
        if (req.body.category != null) {
            res.task.category = req.body.category;
        }

        const updatedTask = await res.task.save();

        await Notification.deleteMany({ taskId: res.task._id });

        if (updatedTask.status !== 'Concluída') {
            const notificationPromises = [];

            // Notificação para o dia do vencimento
            notificationPromises.push(new Notification({
                title: 'Tarefa Vencendo Hoje',
                body: `A ${updatedTask.category} "${updatedTask.name}" vence hoje.`,
                taskId: updatedTask._id,
                userId: req.userId,
                scheduledTime: updatedTask.deadline,
            }).save());

            // Notificação para 3 dias antes do vencimento
            const threeDaysBefore = new Date(updatedTask.deadline);
            threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
            notificationPromises.push(new Notification({
                title: 'Tarefa Vencendo em 3 Dias',
                body: `Você tem uma ${updatedTask.category} "${updatedTask.name}" vencendo em 3 dias.`,
                taskId: updatedTask._id,
                userId: req.userId,
                scheduledTime: threeDaysBefore,
            }).save());

            await Promise.all(notificationPromises);
        }

        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para excluir uma tarefa por ID
router.delete('/:id', getTaskById, async (req, res) => {
    try {
        if (res.task.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        await Notification.deleteMany({ taskId: res.task._id });
        await res.task.deleteOne();
        res.json({ message: 'Tarefa e notificações excluídas com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Função para obter uma tarefa por ID
async function getTaskById(req, res, next) {
    try {
        const task = await Task.findById(req.params.id);
        if (task == null) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        res.task = task;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = app => app.use('/task', router);