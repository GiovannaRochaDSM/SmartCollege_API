const express = require('express');
const router = express.Router();
const Subjects = require('../models/subjects');

// Rota para obter todas as matérias
router.get('/', async (req, res) => {
    try {
        const subjects = await Subjects.find();
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter uma matéria por ID
router.get('/:id', getSubjectsById, (req, res) => {
    try {
        res.json(res.subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para criar uma matéria
router.post('/', async (req, res) => {
    const { name } = req.body;
    try {
        if (await Subjects.findOne({ name }))
          return res.json({ message: 'Matéria já cadastrada!' });

        const subjects = new Subjects({
            name: req.body.name,
            acronym: req.body.acronym,
            grades: req.body.grades,
            abscence: req.body.abscence
        });
        const newSubjects = await subjects.save();
        res.status(201).json(newSubjects);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para atualizar uma matéria por ID
router.put('/:id', getSubjectsById, async (req, res) => {
    try {
        if (req.body.name != null) {
            res.subjects.name = req.body.name;
        }
        if (req.body.acronym != null) {
            res.subjects.acronym = req.body.acronym;
        }
        if (req.body.grades != null) {
            res.subjects.grades = req.body.grades;
        }
        if (req.body.abscence != null) {
            res.subjects.abscence = req.body.abscence;
        }

        const updatedSubjects = await res.subjects.save();
        res.json(updatedSubjects);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para excluir uma matéria por ID
router.delete('/:id', getSubjectsById, async (req, res) => {
    try {
        await res.subjects.deleteOne();
        res.json({ message: 'Matéria excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Função para obter uma matéria por ID
async function getSubjectsById(req, res, next) {
    try {
        const subjects = await Subjects.findById(req.params.id);
        if (subjects == null) {
            return res.status(404).json({ message: 'Matéria não encontrada' });
        }
        res.subjects = subjects;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = router;