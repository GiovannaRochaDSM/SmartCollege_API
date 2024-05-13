const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Publication = require('../models/feed'); //vinculo com a feed.js

router.use(authMiddleware);

// Rota para obter todas as publicações
router.get('/', async (req, res) => {
    try {
        const publications = await Publication.find();
        res.json(publications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Rota para obter uma publicação por ID
router.get('/:id', getPublicationById, (req, res) => {
    try {
        res.json(res.publication);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Rota para criar uma publicação
router.post('/', async (req, res) => {
    const { title, publication, dateTime, image } = req.body;
    try {
        const publication = new Publication({
            title: req.body.title,
            publication: req.body.publication,
            dateTime: req.body.dateTime,
            image: req.body.image
        });
        
        const newPublication = await publication.save();
        res.status(201).json(newPublication);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Rota para atualizar uma publicação por ID
router.put('/:id', getPublicationById, async (req, res) => {
    try {
        if (req.body.title != null) {
            res.publication.title = req.body.title;
        }
        if (req.body.publication != null) {
            res.publication.publication = req.body.publication;
        }
        if (req.body.dateTime != null) {
            res.publication.dateTime = req.body.dateTime;
        }
        if (req.body.image != null) {
            res.publication.image = req.body.image;
        }

        const updatedPublication = await res.publication.save();
        res.json(updatedPublication);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Rota para excluir uma publicação por ID
router.delete('/:id', getPublicationById, async (req, res) => {
    try {
        await res.publication.deleteOne();
        res.json({ message: 'Publicação excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Middleware para obter uma publicação por ID
async function getPublicationById(req, res, next) {
    try {
        const publication = await Publication.findById(req.params.id);
        if (publication == null) {
            return res.status(404).json({ message: 'Publicação não encontrada!' });
        }
        res.publication = publication;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = app => app.use('/publications', router);
