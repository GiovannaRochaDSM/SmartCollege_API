const mongoose = require('../../database');
const subjects = require('./subjects.js');
const user = require('./user.js');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  priority: {
    type: String,
    enum: ['Baixa', 'Média', 'Alta'],
    default: 'Média'
  },
  deadline: Date,
  status: {
    type: String,
    enum: ['Pendente', 'Em progresso', 'Concluída'],
    default: 'Pendente'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subjects', 
    required: true
  },
  category: {
    type: String,
    enum: ['Atividade', 'Avaliação', 'Estudo']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const task = mongoose.model('Task', taskSchema);
module.exports = task;