const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const User = require('../models/user');
const authConfig = require('../../config/auth.json');
const nodemailer = require('nodemailer');
const fs = require('fs');
const mustache = require('mustache');
const router = express.Router();
require('dotenv').config();

const authState = {
    lastAuthenticatedEmail: null,
    lastInformedEmail: null
};

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
         expiresIn: 86400
        });
}

function generateRawAuthCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateAuthCode() {
    const rawAuthCode = generateRawAuthCode();
    const hashedAuthCode = await bcrypt.hash(rawAuthCode, 10);
    return { rawAuthCode, hashedAuthCode };
}

router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: 'Usuário já cadastrado' });
        }

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id })
        });
    } catch (err) {
        return res.status(400).send({ error: 'Ocorreu um erro ao cadastrar' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password authCode authCodeExpires');

        if (!user) {
            return res.status(400).send({ error: 'Usuário não encontrado'});
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: 'Senha inválida'});
        }

        const now = new Date();
        if (user.authCode && user.authCodeExpires > now) {
            authState.lastAuthenticatedEmail = email;
            return res.status(200).send({ message: 'Código de autenticação já enviado e ainda é válido.' });
        }

        const { rawAuthCode, hashedAuthCode } = await generateAuthCode();
        now.setMinutes(now.getMinutes() + 10);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                authCode: hashedAuthCode,
                authCodeExpires: now
            }
        });

        authState.lastAuthenticatedEmail = email;

        const htmlTemplate = fs.readFileSync('src/resources/mail/auth/send_auth_code.html', 'utf8');
        const data = { authCode: rawAuthCode };
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
            subject: 'Código de Autenticação',
            html: renderedHtml
        };

        await transporter.sendMail(mailOptions);

        res.send({ message: 'Código de autenticação enviado para o e-mail'});

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erro interno no servidor' });
    }
});

router.post('/validate_auth_code', async (req, res) => {
    const { authCode } = req.body;
    const email = authState.lastAuthenticatedEmail;
    try {
        const user = await User.findOne({ email }).select('+authCode authCodeExpires');

        if (!user) {
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        const isMatch = await bcrypt.compare(authCode, user.authCode);

        if (!isMatch) {
            return res.status(400).send({ error: 'Código de autenticação inválido' });
        }

        const now = new Date();   

        if (now > user.authCodeExpires) {
            return res.status(400).send({ error: 'Código de autenticação expirado.' });
        }

        await user.save();

        user.password = undefined;
        user.authCode = undefined;
        user.authCodeExpires = undefined;

        res.send({
            user,
            token: generateToken({ id: user.id })
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erro interno no servidor' });
    }
});

router.post('/validate_forgot_code', async (req, res) => {
    const { authCode } = req.body;
    try {
        const user = await User.findOne({ email: lastInformedEmail }).select('+authCode authCodeExpires');

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });
        
        const isMatch = await bcrypt.compare(authCode, user.authCode);

        if (!isMatch)
            return res.status(400).send({ error: 'Código de autenticação inválido' });

        const now = new Date();

        if (now > user.authCodeExpires)
            return res.status(400).send({ error: 'Código de autenticação expirado.' });

        await user.save();

        user.password = undefined;
        user.authCode = undefined;
        user.authCodeExpires = undefined;

        res.send({ 
            user, 
            token: generateToken({ id: user.id }) 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erro interno no servidor' });
    }
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        const { rawAuthCode, hashedAuthCode } = await generateAuthCode();
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                authCode: hashedAuthCode,
                authCodeExpires: now
            }
        });

        authState.lastInformedEmail = email;

        const htmlTemplate = fs.readFileSync('src/resources/mail/auth/send_auth_code.html', 'utf8');
        const data = {
            authCode: rawAuthCode
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
            subject: 'Esqueci a Senha - Código de Autenticação',
            html: renderedHtml
        };

        await transporter.sendMail(mailOptions);

        return res.send({ message: 'Um e-mail foi enviado com o código de autenticação para redefinição de senha.' });

    } catch (err) {
        res.status(400).send({ error: 'Erro ao tentar enviar o código de autenticação, tente novamente' });
    }
});


router.post('/reset_password', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        if (!password) {
            return res.status(400).send({ error: 'A nova senha não pode estar vazia' });
        }

        user.password = password;
        user.authCode = undefined;
        user.authCodeExpires = undefined;

        await user.save();

       return res.send({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Erro ao tentar redefinir a senha, tente novamente' });
    }
});


module.exports = app => app.use('/auth', router);