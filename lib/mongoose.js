var console = require('unclog');

var app = require('./');
var mongoose = app.mongoose = module.exports = require('mongoose');

var database = mongoose.dbName = app.get('name').toLowerCase();

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD)
    mongoose.url = 'mongodb://' +
    process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
else if (process.env.C9_USER)
    mongoose.url = 'mongodb://' +
    process.env.IP + database;
else if (process.env.MONGOLAB_URI)
    mongoose.url = process.env.MONGOLAB_URI;
else if (process.env.MONGOHQ_URL)
    mongoose.url = process.env.MONGOHQ_URL;
else
    mongoose.url = 'mongodb://localhost/' + database;

mongoose.connect(mongoose.url, function(err, res) {
    if (err) console.error('Mongoose couldn\'t connect to:', mongoose.url, err);
    else console.verbose('Mongoose connected to:', mongoose.url);
}); //.set('debug', true);

// var db = mongoose.db = mongoose.connection;
// db.on('open', function open() {
//     console.verbose('Mongoose connection opened.');
// });
// db.on('error', function error(err) {
//     console.error('MongoDB error:', err);
//     reject(err);
//     process.exit(1);
// });
