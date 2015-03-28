var console = require('unclog');

console.log('Initializing...');

// App core (express)
var express = require('express');
var app = module.exports = express();
app.router = express.Router();

// General utils
var util = require('util');
var toShortString = require('to-short-string');
var extend = require('extend');
var Path = require('path');
var Promise = require('bluebird');
var toShortString = require('to-short-string');
var moment = require('moment');
var slug = require('slug');

// Config
var config = app.settings = extend(true, app.settings, require('./config'));
var dev = config.dev;
var basedir = config.basedir;
// console.debug('app.settings:', app.settings);

// MongoDB
var mongoose = require('./mongoose.js');

// Express Addons
var compress = require('compression')();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var stylus = require('stylus');
var nib = require('nib')();
var jadeStatic = require('connect-jade-static');

app.cookieParser = require('cookie-parser');
app.secretSauce = app.get('name') + ' secret sauce';
app.session = require('express-session');

// Passport & User Auth
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google').Strategy;

// Passport Modification: use `app.[de]serializeUser()` for auto better logging
app.serializeUser = serializeUser;
app.deserializeUser = deserializeUser;

function serializeUser(serializeUser) {
    passport.serializeUser(function(user, done) {
        console.verbose('Serializing', toShortString(user));
        serializeUser(user, function(err, id) {
            if (err) console.err('Couldn\'t Serialize', toShortString(user), err);
            console.verbose('Serialized', toShortString(user));
            done(err, id)
        });
    });
}

function deserializeUser(deserializeUser) {
    passport.deserializeUser(function(id, done) {
        console.verbose('DeSerializing (%s)', toShortString(id));
        deserializeUser(id, function(err, user) {
            if (err) console.err('Couldn\'t DeSerialize', toShortString(user), err);
            console.verbose('DeSerialized', toShortString(user));
            done(err, user)
        });
    });
}


var locals = app.locals.locals = app.locals;


// Make utils available in Jade
locals.toShortString = toShortString;
locals.moment = moment;
locals.slug = slug;

// DEV locals & debugging settings
locals.name = config.name
locals.resources = config.resources;
locals.dev = dev;
if (dev) {
    locals.pretty = true;
    app.use(function setDevHeaders(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    });
}


// Initiazlize runtime

// Log requests
app.use(console);

app.use(app.cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.MongoStore = require('connect-mongo')(app.session);
app.sessionStore = new app.MongoStore({
    url: app.mongoose.url,
});
app.use(app.session({
    secret: app.secretSauce,
    store: app.sessionStore,
    saveUninitialized: true,
    resave: true,
}));


if (!dev)
    app.use(compress);

var basedirs = [
    app.config.basedir + '/..',
    app.config.basedir,
    __dirname,
];
var basedirsForViews = [];
basedirs.forEach(function(basedir) {
    basedirsForViews.push(Path.join(basedir + '/.'));
    basedirsForViews.push(Path.join(basedir + '/views'));
    ['/public', '/client'].forEach(function(topdir) {
        app.use(stylus.middleware({
            src: Path.join(basedir + topdir),
            compile: function(str, path) {
                return stylus(str)
                    .set('filename', path)
                    .set('compress', !dev)
                    .use(nib)
                    .import('nib');
            }
        }));
        app.use(express.static(basedir + topdir));
    });
    ['/views/templates', '/client/components'].forEach(function(topdir) {
        // console.debug(Path.join(basedir + topdir));
        // console.debug('/' + topdir.split(/[\/\\]/).pop());
        app.use(jadeStatic({
            baseDir: Path.join(basedir + topdir),
            baseUrl: '/' + topdir.split(/[\/\\]/).pop(),
            jade: {
                pretty: dev,
            }
        }));
    });
});
app.set('views', basedirsForViews);
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(app.cookieParser());
app.use(methodOverride());


// Last page
app.use(function saveLastPage(req, res, next) {
    req.session.lastpage = req.session.lastpage || '/';
    if (req.method !== 'GET')
        return next();
    for (var array = ['test', 'login', 'register', 'logout', '.'], i = 0; i < array.length; i++)
        if (req.url.indexOf(array[i]) !== -1)
            return next();
    req.session.lastpage = req.url;
    next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    if (!req.user) return next();
    var user = res.locals.user = JSON.parse(JSON.stringify(req.user));
    delete user.password;
    delete user.hash;
    delete user.salt;
    delete user.__v;
    user.id = user._id;
    delete user._id;
    next();
});


// ** Express modifications

// make `app.set()` case-insensitive
(function(set) {
    set = set.bind(app);
    app.set = function(setting) {
        setting = setting.toLowerCase();
        return set.apply(app, arguments);
    }
})(app.set);


// Always re-attach a default error handler at the end.
// Also adds a default main route '/' - ONLY if a '/' is absent.
// All this by making wrappers.. of a wrapper.. of a wrapper
app._use = app.use;
app._get = app.get;
app._post = app.post;
app._all = app.all;
app.use = defaultRoutesWrapperWrapper(app._use);
app.get = defaultRoutesWrapperWrapper(app._get);
app.post = defaultRoutesWrapperWrapper(app._post);
app.all = defaultRoutesWrapperWrapper(app._all);

function defaultRoutesWrapperWrapper(_) {
    return defaultRoutesWrapper.bind(_);
}

function defaultRoutesWrapper() {
    var value = this.apply(app, arguments);
    defaultRoutesReModifier();
    return value;
}

function defaultRoutesReModifier() {
    var routes = app._router.stack;
    routes.forEach(removeMiddlewares);
    app._get('/', defaultRoute_main);
    app._use(catch404s);
    app._use(catchErrors);
}

function removeMiddlewares(route, i, routes) {
    switch (route.handle.name) {
        case 'catch404s':
        case 'catchErrors':
        case 'defaultRoute_main':
            routes.splice(i, 1);
    }
    if (route.route)
        route.route.stack.forEach(removeMiddlewares);
}

function defaultRoute_main(req, res, next) {
    console.verbose('Loading SimpleApp default route');
    // res.send('/');
    res.render('index');
}

function catch404s(req, res, next) {
    var err = new Error('Not Found: ' + (req.method != 'GET' ? (req.method + ' ') : '') + req.path)
    err.status = 404;
    next(err);
}

function catchErrors(err, req, res, next) {
    if (err.status != 404)
        console.err(err);

    if (res.headersSent) return;

    var title = 'Something went wrong...';
    var status = err.status || 500;

    var message = err.message;
    if (message.indexOf('.jade:') > -1)
        message = title = 'Jade error';

    res.status(status);

    res.locals.title = title;
    res.locals.status = status;
    res.locals.message = message;

    if (req.headers.accept && req.headers.accept.indexOf('json') > -1)
        res.json(err.message);
    else
        res.render('error');
}


// Helper Route Middlewares
app.isLoggedIn = app.reqUser = function isLoggedIn(req, res, next) {
    if (!req.user) return res.status(401).redirect('/login');
    if (req.user && (typeof(req.user.logged_in) != 'undefined' && !req.user.logged_in)) return res.status(401).redirect('/login');
    next();
};
app.isAdmin = app.reqAdmin = function isAdmin(req, res, next) {
    if (!req.user) return res.status(401).redirect('/login');
    if (!req.user.admin) return res.status(403).redirect(req.lastpage);
    next();
};
app.isLoggedOut = app.reqNotUser = function isLoggedOut(req, res, next) {
    if (req.user) return res.status(307).redirect('logout');
    next();
};

// =======================================
// All ready for server to start listening
app.server = app.listen(app.get('port'), app.get('ip'), function() {
    console.verbose('Express server listening on',
        app.server.address().address +
        (app.server.address().port == 80 ? '' : (':' + app.server.address().port))
    );
    app.mongoose.connection.on('open', function() {
        console.log(app.get('title'), 'Ready!', (dev ? '(development mode)' : ''), '\u0007');

    });
});
var io = require('./socket.js');


// var cluster = require('cluster');
// if (cluster.isMaster) {
//     require('os').cpus().forEach(cluster.fork);
//     cluster.on('exit', cluster.fork);
//     // return;
// }
