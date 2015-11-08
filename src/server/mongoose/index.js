try {
    global.mongoose = require('../../../mongoose');
} catch (err) {
    global.mongoose = require('mongoose');
}

app.mongoose = module.exports = global.mongoose;

var database = mongoose.dbName = app.nameslug;

if (config.mongodburl)
    mongoose.url = config.mongodburl;
else if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD)
    mongoose.url = 'mongodb://' +
    process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
else if (process.env.C9_USER)
    mongoose.url = 'mongodb://' + process.env.IP + '/' + database;
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


var findOrCreate = mongoose.findOrCreate = require('./find-or-create');
var objectify = mongoose.objectify = require('./objectify');
var userutils = mongoose.userutils = require('./userutils');
var desensitize = mongoose.desensitize = require('./desensitize');
var populateAll = mongoose.populateAll = require('./populate-all');
var deepPopulate = mongoose.deepPopulate = require('mongoose-deep-populate')(mongoose);
var autoPopulate = mongoose.autoPopulate = require('mongoose-autopopulate');
// var autoIncrement= mongoose.autoIncrement= require('./auto-increment');

mongoose.getUseDbModel = function getUseDbModel(dbSlug, modelIdStr, schema) {
    var baseDbName = mongoose.connection.name;
    dbSlug = _.kebabCase(dbSlug);
    // dbSlug = _.camelCase(dbSlug).toLowerCase();
    modelIdStr = _.camelCase(modelIdStr).toLowerCase();
    modelIdStr = pluralize.singular(modelIdStr);
    if (!dbSlug || !dbSlug.length || typeof dbSlug != 'string' || baseDbName == dbSlug)
        var db = mongoose;
    else {
        dbSlug = baseDbName + '_' + dbSlug;
        if (!mongoose.dbs) mongoose.dbs = {};
        if (mongoose.dbs[dbSlug])
            var db = mongoose.dbs[dbSlug];
        else
            var db = mongoose.dbs[dbSlug] = mongoose.connection.useDb(dbSlug);
    }
    if (!modelIdStr) return db;
    if (!db.models) db.models = {};
    if (!schema && db.models[modelIdStr]) return db.models[modelIdStr];
    if (!schema) schema = mongoose.model(modelIdStr).schema;
    var model = db.models[modelIdStr] = db.model(modelIdStr, schema);
    return model;
};

try {
    Promise.promisifyAll(mongoose);
} catch (err) {}
try {
    Promise.promisifyAll(mongoose.prototype);
} catch (err) {}


// Set default Query Options
var __setOptions = mongoose.Query.prototype.setOptions;
mongoose.Query.prototype.setOptions = function(options, overwrite) {
    __setOptions.apply(this, arguments);
    this.options.new = true; // For findAndUpdate to return new doc rather than old
    return this;
};


// Additional Default Data Types
mongoose.Schema.Types.StringRequired = {
    type: 'String',
    required: true,
};
mongoose.Schema.Types.NumberRequiredDefault0 = {
    type: 'Number',
    required: true,
    default: 0,
};

mongoose._model = mongoose.model;
mongoose.model = function mongoose_model_patch(collectionName, schema, ...restArgs) {
    if (!collectionName) throw new Error('mongoose.model needs a collectionName');
    collectionName = collectionName.toLowerCase();
    if (!schema) return mongoose._model.apply(mongoose, arguments);
    if (!schema.plugin) schema = new mongoose.Schema(schema);
    schema.plugin(findOrCreate);
    schema.plugin(deepPopulate);
    schema.plugin(autoPopulate);

    if (config.populateall)
        schema.plugin(populateAll);

    if (collectionName.match(/user/))
        schema.plugin(userutils);

    var model = mongoose._model(collectionName, schema, ...restArgs);

    Promise.promisifyAll(model);
    Promise.promisifyAll(model.prototype);

    return model;
}

require('./anonuser');
