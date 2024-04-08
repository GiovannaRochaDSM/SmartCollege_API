const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://dbUser:dbUserPassword@clustersc.orhnbu0.mongodb.net/smart_college?retryWrites=true&w=majority&appName=ClusterSC');
mongoose.Promise = global.Promise;

module.exports = mongoose;