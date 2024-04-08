const mongoose = require('../../database');
const subjects = require('./subjects.js');
const bcrypt = require('bcryptjs');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
    ref: subjects, 
    required: true
  },
  category: {
    type: String,
    enum: ['Atividade', 'Avaliação', 'Estudo']
  }
});

const task = mongoose.model('Task', taskSchema);
module.exports = task;