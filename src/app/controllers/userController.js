const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const mustache = require('mustache');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middlewares/auth');
const User = require('../models/user');
const university = require('../models/university');
const router = express.Router();
const mongoose = require('mongoose'); // Importe o Mongoose

router.use(authMiddleware);

// Obter dados do usuário atual
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('university');
        if (!user) return res.status(400).send({ error: 'Usuário não encontrado' });

        const userData = {
            name: user.name,
            studentRecord: user.studentRecord,
            nickname: user.nickname,
            photo: user.photo,
            email: user.email,
            isBond: user.isBond,
            university: user.university
        };

        res.send(userData);
    } catch (err) {
        res.status(400).send({ error: 'Erro ao buscar dados do usuário' });
    }
});

// Atualizar usuário atual
router.put('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(400).send({ error: 'Usuário não encontrado' });

        if (req.body.name != null) user.name = req.body.name;
        if (req.body.studentRecord != null) user.studentRecord = req.body.studentRecord;
        if (req.body.nickname != null) user.nickname = req.body.nickname;
        if (req.body.photo != null) user.photo = req.body.photo;
        if (req.body.email != null) user.email = req.body.email;
        if (req.body.isBond != null) {
            if (req.body.isBond === true && !req.body.university) {
                return res.status(400).send({ error: 'É obrigatório informar a faculdade vinculada.' });
            }
            user.isBond = req.body.isBond;
            if (req.body.isBond) {
                if (!req.body.university) {
                    return res.status(400).send({ error: 'É obrigatório informar o ID da universidade.' });
                }
                // Verifica se o ID da universidade é válido
                if (!mongoose.Types.ObjectId.isValid(req.body.university)) {
                    return res.status(400).send({ error: 'ID da universidade inválido.' });
                }
                user.university = req.body.university;  // Atribuir o ObjectId da universidade
            } else {
                user.university = undefined;
            }
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
        if (!user) return res.status(400).send({ error: 'Usuário não encontrado' });

        await User.findByIdAndRemove(userId);
        res.send({ message: 'Conta excluída com sucesso' });
    } catch (err) {
        res.status(400).send({ error: 'Erro ao excluir conta do usuário' });
    }
});

// Enviar Student Record por e-mail
router.post('/send_student_record', async (req, res) => {
    const { email, universityName, universityState, universityCity, degreeCourse } = req.body;

    console.log(req.body); // Verifique os dados recebidos

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.error('Usuário não encontrado para o e-mail:', email);
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        const acceptUrl = `http://localhost:3000/me/accept_student_record/${user._id}`;
        const recuseUrl = `http://localhost:3000/me/recuse_student_record/${user._id}`;

        const htmlTemplatePath = 'src/resources/mail/services/send_student_record.html';
        let htmlTemplate;

        try {
            htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');
        } catch (err) {
            console.error('Erro ao ler o template HTML:', err);
            return res.status(500).send({ error: 'Erro interno ao enviar e-mail' });
        }

        const data = {
            studentRecord: user.studentRecord,
            universityName: universityName,
            universityState: universityState,
            universityCity: universityCity,
            degreeCourse: Array.isArray(degreeCourse) ? degreeCourse.join(', ') : '',
            acceptUrl: acceptUrl,
            recuseUrl: recuseUrl
        };

        const renderedHtml = mustache.render(htmlTemplate, data);

        const transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Student Record',
            html: renderedHtml
        };

        await transporter.sendMail(mailOptions);

        return res.send({ message: 'E-mail enviado com sucesso' });

    } catch (err) {
        console.error('Erro ao enviar e-mail:', err);
        res.status(400).send({ error: 'Erro ao enviar e-mail, tente novamente' });
    }
});


// Aceitar Student Record
router.put('/accept_student_record/:userId', async (req, res) => {
    const { isBond, university } = req.body;

    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        if (isBond) {
            if (!university) {
                return res.status(400).send({ error: 'É obrigatório informar o ID da universidade.' });
            }
            // Verifica se o ID da universidade é válido
            if (!mongoose.Types.ObjectId.isValid(university)) {
                return res.status(400).send({ error: 'ID da universidade inválido.' });
            }

            user.isBond = true;
            user.university = university;  // Atribuir o ObjectId da universidade
        } else {
            user.isBond = false;
            user.university = undefined;
        }

        await user.save();
        res.send({ message: 'Student record aceito e universidade atualizada', user });
    } catch (err) {
        console.error('Erro ao aceitar student record:', err);
        res.status(400).send({ error: 'Erro ao aceitar student record' });
    }
});

// Recusar Student Record
router.put('/recuse_student_record/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        user.isBond = false;
        user.university = undefined;

        await user.save();
        res.send({ message: 'Student record recusado e vínculo removido', user });
    } catch (err) {
        console.error('Erro ao recusar student record:', err);
        res.status(400).send({ error: 'Erro ao recusar student record' });
    }
});

module.exports = app => app.use('/me', router);