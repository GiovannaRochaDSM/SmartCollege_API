const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Subjects = require('../models/subjects');
const Task = require('../models/task');

router.use(authMiddleware);

// Rota para obter todas as tarefas
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().populate('subject');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter uma tarefa por ID
router.get('/:id', getTaskById, (req, res) => {
    try {
        res.json(res.task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para criar uma tarefa
router.post('/', async (req, res) => {
    const { name } = req.body;

    try {
        if (await Task.findOne({ name }))
            return res.json({ message: 'Tarefa já cadastrada!' });

        const task = new Task({
            name: req.body.name,
            description: req.body.description,
            priority: req.body.priority,
            deadline: req.body.deadline,
            status: req.body.status,
            subject: req.body.subject,
            category: req.body.category
        });

        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para atualizar uma tarefa por ID
router.put('/:id', getTaskById, async (req, res) => {
    try {
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
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para excluir uma tarefa por ID
router.delete('/:id', getTaskById, async (req, res) => {
    try {
        await res.task.deleteOne();
        res.json({ message: 'Tarefa excluída com sucesso!' });
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