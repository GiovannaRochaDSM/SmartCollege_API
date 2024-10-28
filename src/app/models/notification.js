const mongoose = require('../../database');
const user = require('./user.js');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
});

const notification = mongoose.model('Notification', notificationSchema);
module.exports = notification;
