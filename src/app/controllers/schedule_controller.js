const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const authMiddleware = require('../middlewares/auth');
const Subjects = require('../models/subjects');
const User = require('../models/user');
 
router.use(authMiddleware);
 
// Rota para obter todos os horários
router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.find({ user: req.userId }).populate('subject');
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
 
// Rota para obter um horário por ID
router.get('/:id', getScheduleById, (req, res) => {
    try {
        if (res.schedule.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        res.json(res.schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
 
// Rota para criar um novo horário
router.post('/', async (req, res) => {
    try {
        const newSchedule = new Schedule({
            dayWeek: req.body.dayWeek,
            room: req.body.room,
            time: req.body.time,
            subject: req.body.subject,
            user: req.userId
        });
       
        const savedSchedule = await newSchedule.save();
        res.status(201).json(savedSchedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
 
// Rota para atualizar um horário por ID
router.put('/:id', getScheduleById, async (req, res) => {
    try {
        if (res.schedule.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        if (req.body.dayWeek != null) {
            res.schedule.dayWeek = req.body.dayWeek;
        }
        if (req.body.room != null) {
            res.schedule.room = req.body.room;
        }
        if (req.body.time != null) {
            res.schedule.time = req.body.time;
        }
        if (req.body.subjects != null) {
            res.schedule.subjects = req.body.subjects;
        }
 
        const updatedSchedule = await res.schedule.save();
        res.json(updatedSchedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
 
// Rota para excluir um horário por ID
router.delete('/:id', getScheduleById, async (req, res) => {
    try {
        if (res.schedule.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        await res.schedule.deleteOne();
        res.json({ message: 'Horário excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
 
// Middleware para obter um horário por ID
async function getScheduleById(req, res, next) {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Horário não encontrado!' });
        }
        res.schedule = schedule;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
 
module.exports = app => app.use('/schedule', router);