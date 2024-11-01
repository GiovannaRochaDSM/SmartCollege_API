const express = require('express');
const User = require('../models/user');
const Publication = require('../models/feed');
const authMiddleware = require('../middlewares/auth');
const { checkBond, checkCoord } = require('../middlewares/check_permissions');
const router = express.Router();

router.use(authMiddleware);

router.get('/publication', checkBond, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user.university) {
            return res.status(403).json({ message: 'Acesso negado. Você não está vinculado a uma universidade.' });
        }

        const publications = await Publication.find({ university: user.university })
            .populate('user')
            .populate('university')
            .sort({ dateTime: -1 });

        res.json(publications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/publication/:id', async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id)
            .populate('user')
            .populate('university');

        if (!publication) {
            return res.status(404).json({ message: 'Publicação não encontrada.' });
        }

        const user = await User.findById(req.userId);

    const publicationUniversityId = publication.university._id.toString();
    const userUniversityId = user.university.toString();


    if (publicationUniversityId !== userUniversityId) {
        return res.status(403).json({ message: 'Acesso negado. Esta publicação não pertence à sua universidade.' });
    }

        res.json(publication);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/publication', checkBond, checkCoord, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        const newPublication = new Publication({
            title: req.body.title,
            publication: req.body.publication,
            dateTime: req.body.dateTime,
            image: req.body.image,
            user: req.userId,
            university: user.university
        });

        const savedPublication = await newPublication.save();
        res.status(201).json(savedPublication);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/publication/:id/like', authMiddleware, async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return res.status(404).json({ message: 'Publicação não encontrada.' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const nickname = user.nickname;

        if (publication.likedBy.includes(nickname)) {
            publication.likes -= 1;
            publication.likedBy = publication.likedBy.filter(n => n !== nickname);
        } else {
            publication.likes += 1;
            publication.likedBy.push(nickname);
        }

        await publication.save();

        res.json({ likes: publication.likes, likedBy: publication.likedBy });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

router.put('/publication/:id', checkBond, checkCoord, getPublicationById, async (req, res) => {
    try {
        if (req.body.title !== null) {
            res.publication.title = req.body.title;
        }
        if (req.body.publication !== null) {
            res.publication.publication = req.body.publication;
        }
        if (req.body.image !== null) {
            res.publication.image = req.body.image;
        }

        const updatedPublication = await res.publication.save();
        res.json(updatedPublication);
    } catch (err) {
        res.status(400).json({ message: 'Falha ao atualizar publicação.' });
    }
});

router.delete('/publication/:id', checkBond, checkCoord, getPublicationById, async (req, res) => {
    try {
        await res.publication.deleteOne();
        res.json({ message: 'Publicação excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Falha ao excluir publicação.' });
    }
});

async function getPublicationById(req, res, next) {
    try {
        const publication = await Publication.findById(req.params.id);
        
        if (publication == null) {
            return res.status(404).json({ message: 'Publicação não encontrada.' });
        }

        res.publication = publication;
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao buscar publicação.' });
    }
}

module.exports = app => app.use('/feed', router);