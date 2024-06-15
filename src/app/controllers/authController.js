// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const mailer = require('../../modules/mailer');
// const User = require('../models/user');
// const authConfig = require('../../config/auth.json');
// const nodemailer = require('nodemailer');
// const fs = require('fs');
// const mustache = require('mustache');
// const router = express.Router();
// require('dotenv').config();

// let lastAuthenticatedEmail = '';

// function generateToken(params = {}) {
//     return jwt.sign(params, authConfig.secret, {
//         expiresIn: 86400
//     });
// }

// function generateRawAuthCode() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// async function generateAuthCode() {
//     const rawAuthCode = generateRawAuthCode();
//     const hashedAuthCode = await bcrypt.hash(rawAuthCode, 10); 
//     return { rawAuthCode, hashedAuthCode };
// }

// router.post('/register', async (req, res) => {
//     const { email } = req.body;
//     try {
//         if (await User.findOne({ email }))
//             return res.status(400).send({ error: 'Usuário já cadastrado' });

//         const user = await User.create(req.body);

//         user.password = undefined;

//         return res.send({ 
//             user, 
//             token: generateToken({ id: user.id }) 
//         });
//     } catch (err) {
//         return res.status(400).send({ error: 'Ocorreu um erro ao cadastrar' });
//     }
// });

// router.post('/authenticate', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email }).select('+password');

//         if (!user)
//             return res.status(400).send({ error: 'Usuário não encontrado'});

//         if (!await bcrypt.compare(password, user.password))
//             return res.status(400).send({ error: 'Senha inválida'});

//         const { rawAuthCode, hashedAuthCode } = await generateAuthCode();
        
//         const now = new Date();
//         now.setMinutes(now.getMinutes() + 10);

//         await User.findByIdAndUpdate(user.id, {
//             '$set': {
//                 authCode: hashedAuthCode,
//                 authCodeExpires: now
//             }
//         });

//         lastAuthenticatedEmail = email;

//         const htmlTemplate = fs.readFileSync('src/resources/mail/auth/send_auth_code.html', 'utf8');
//         const data = { authCode: rawAuthCode };
//         const renderedHtml = mustache.render(htmlTemplate, data);

//         const transporter = nodemailer.createTransport({
//             service: 'outlook',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Código de Autenticação',
//             html: renderedHtml
//         };

//         await transporter.sendMail(mailOptions);

//         res.send({ message: 'Código de autenticação enviado para o e-mail'});

//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: 'Erro interno no servidor' });
//     }
// });

// router.post('/validate_auth_code', async (req, res) => {
//     const { authCode } = req.body;
//     try {
//         const user = await User.findOne({ email: lastAuthenticatedEmail }).select('+authCode authCodeExpires');

//         if (!user)
//             return res.status(400).send({ error: 'Usuário não encontrado' });

//         const isMatch = await bcrypt.compare(authCode, user.authCode);

//         if (!isMatch)
//             return res.status(400).send({ error: 'Código de autenticação inválido' });

//         const now = new Date();

//         if (now > user.authCodeExpires)
//             return res.status(400).send({ error: 'Código de autenticação expirado.' });

//         await user.save();

//         user.password = undefined;
//         user.authCode = undefined;
//         user.authCodeExpires = undefined;

//         res.send({ 
//             user, 
//             token: generateToken({ id: user.id }) 
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: 'Erro interno no servidor' });
//     }
// });

// router.post('/forgot_password', async (req, res) => {
//     const { email } = req.body;

//     try {
//         const user = await User.findOne({ email });

//         if (!user)
//             return res.status(400).send({ error: 'Usuário não encontrado' });

//         const token = crypto.randomBytes(20).toString('hex');
//         const resetUrl = `https://smartcollege-api.onrender.com/auth/reset_password/${token}`;

//         const htmlTemplate = fs.readFileSync('src/resources/mail/auth/forgot_password.html', 'utf8');

//         const data = {
//             resetUrl: resetUrl
//         };

//         const renderedHtml = mustache.render(htmlTemplate, data);

//         const transporter = nodemailer.createTransport({
//             service: 'outlook',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Redefinição de Senha',
//             html: renderedHtml
//         };

//         const info = await transporter.sendMail(mailOptions);

//         const now = new Date();
//         now.setHours(now.getHours() + 1);

//         await User.findByIdAndUpdate(user.id, {
//             '$set': {
//                 passwordResetToken: token,
//                 passwordResetExpires: now
//             }
//         });

//         return res.send({ message: 'Um e-mail foi enviado para redefinição de senha' });

//     } catch (err) {
//         res.status(400).send({ error: 'Erro ao tentar recuperar a senha, tente novamente' });
//     }
// });

// router.post('/reset_password/:token', async (req, res) => {
//     const token = req.params.token;

//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email })
//             .select('+passwordResetToken passwordResetExpires');
        
//         if (!user)
//             return res.status(400).send({ error: 'Usuário não encontrado' });
        
//         if (token !== user.passwordResetToken)
//             return res.status(400).send({ error: 'Token inválido' });

//         const now = new Date();

//         if (now > user.passwordResetExpires)
//             return res.status(400).send({ error: 'Token expirado, gere um novo token' });

//         user.password = password;

//         await user.save();

//         res.send();
//     } catch (err) {
//         res.status(400).send({ error: 'Não é possível redefinir a senha, tente novamente' });
//     }
// });

// module.exports = app => app.use('/auth', router);

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
const path = require('path'); // Adicionado
const router = express.Router();
require('dotenv').config();

// Configurar o Express para servir arquivos estáticos do diretório 'public'
const app = express();
app.use(express.static(path.join(__dirname, '../../public'))); // Atualize o caminho conforme necessário

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Usuário já cadastrado' });

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
    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'Usuário não encontrado' });

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Senha inválida' });

    user.password = undefined;

    res.send({ 
        user, 
        token: generateToken({ id: user.id }) 
    });
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        const token = crypto.randomBytes(20).toString('hex');
        const resetUrl = `https://smartcollege-api.onrender.com/auth/reset_password/${token}`;

        const htmlTemplate = fs.readFileSync('src/resources/mail/auth/forgot_password.html', 'utf8');

        const data = {
            resetUrl: resetUrl
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
            subject: 'Redefinição de Senha',
            html: renderedHtml
        };

        const info = await transporter.sendMail(mailOptions);

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        return res.send({ message: 'Um e-mail foi enviado para redefinição de senha' });

    } catch (err) {
        res.status(400).send({ error: 'Erro ao tentar recuperar a senha, tente novamente' });
    }
});

// Rota para servir o HTML de redefinição de senha
router.get('/reset_password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/src/resources/mail/auth/reset_password.html'));
});

// Rota para processar a redefinição de senha
router.post('/reset_password/:token', async (req, res) => {
    const token = req.params.token;
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token inválido' });

        const now = new Date();

        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expirado, gere um novo token' });

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.send({ message: 'Senha atualizada com sucesso' });
    } catch (err) {
        res.status(400).send({ error: 'Não é possível redefinir a senha, tente novamente' });
    }
});

module.exports = app => app.use('/auth', router);
