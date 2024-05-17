const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

// Rota para obter todos os agendamentos/horários
router.get('/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter um agendamento/horários por ID
router.get('/schedules/:id', getScheduleById, (req, res) => {
    try {
        res.json(res.schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para criar um novo agendamento/horários
router.post('/schedules', async (req, res) => {
    const { idSubject, time, room, teacher, user } = req.body;
    try {
        const newSchedule = new Schedule({ 
            idSubject: req.body.idSubject,
            dateTime: req.body.dateTime,
            room: req.body.room,
            teacher: req.body.teacher,
            user: req.body.user,
        });
        
        const savedSchedule = await newSchedule.save();
        res.status(201).json(savedSchedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para atualizar um agendamento/horários por ID
router.put('/schedules/:id', getScheduleById, async (req, res) => {
    try {
        if (req.body.idSubject != null) {
            res.schedule.idSubject = req.body.idSubject;
        }
        if (req.body.dateTime != null) {
            res.schedule.dateTime = req.body.dateTime;
        }
        if (req.body.room != null) {
            res.schedule.room = req.body.room;
        }
        if (req.body.teacher!= null) {
            res.schedule.teacher = req.body.teacher;
        }
        if (req.body.user != null) {
            res.schedule.user = req.body.user;
        }

        const updatedSchedule = await res.schedule.save();
        res.json(updatedSchedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para excluir um agendamento por ID
router.delete('/schedules/:id', getScheduleById, async (req, res) => {
    try {
        await res.schedule.deleteOne();
        res.json({ message: 'Agendamento excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware para obter um agendamento por ID
async function getScheduleById(req, res, next) {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Agendamento não encontrado!' });
        }
        res.schedule = schedule;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = app => app.use('/schedule', router);