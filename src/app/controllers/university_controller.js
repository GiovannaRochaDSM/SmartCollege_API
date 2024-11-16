const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const University = require('../models/university');

router.use(authMiddleware);

// Rota para obter todas as universidades
router.get('/', async (req, res) => {
    try {
        const university = await University.find();
        res.json(university);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter uma universidade por ID
router.get('/:id', getUniversityById, (req, res) => {
    try {
        res.json(res.university);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para criar uma universidade
router.post('/', async (req, res) => {
    const { name } = req.body;

    try {
        if (await University.findOne({ name }))
            return res.json({ message: 'Universidade já cadastrada.' });

        const university = new University({
            name: req.body.name,
            state: req.body.state,
            city: req.body.city,
            degreeCourse: req.body.degreeCourse
        });

        const newUniversity = await university.save();
        res.status(201).json(newUniversity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para atualizar uma universidade por ID
router.put('/:id', getUniversityById, async (req, res) => {
    try {
        if (req.body.name != null) {
            res.university.name = req.body.name;
        }
        if (req.body.state != null) {
            res.university.state = req.body.state;
        }
        if (req.body.city != null) {
            res.university.city = req.body.city;
        }
        if (req.body.degreeCourse != null) {
            res.university.degreeCourse = req.body.degreeCourse;
        }
        
        const updatedUniversity = await res.university.save();
        res.json(updatedUniversity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para excluir uma universidade por ID
router.delete('/:id', getUniversityById, async (req, res) => {
    try {
        await res.university.deleteOne();
        res.json({ message: 'Universidade excluída com sucesso.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Função para obter uma matéria por ID
async function getUniversityById(req, res, next) {
    try {
        const university = await University.findById(req.params.id);
        if (university == null) {
            return res.status(404).json({ message: 'Universidade não encontrada' });
        }
        res.university = university;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = app => app.use('/university', router);