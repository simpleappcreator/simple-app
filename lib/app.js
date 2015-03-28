var console = require('unclog');
console.verbose('Loading...');

// General utils
var util = require('util');
var path = require('path');
var toShortString = require('to-short-string');
var extend = require('extend');
var Path = require('path');
var Promise = require('bluebird');

// App core (express)
var express = require('express');
var app = express();
app.router = express.Router();

// Config
// app.config = require('./config');
getResources = require('./get-resources');

// Socket.io
var getSocket = require('./socket.js');

// MongoDB
var getMongoose = require('./mongoose.js');

// Express Addons
app.bodyParser = require('body-parser');
app.cookieParser = require('cookie-parser');
app.methodOverride = require('method-override');
app.session = require('express-session');
app.jadeStatic = require('connect-jade-static');

// Passport & User Auth
app.passport = require('passport');
app.passport.LocalStrategy = require('passport-local').Strategy;
app.passport.GoogleStrategy = require('passport-google').Strategy;

module.exports = function getApp(options) {
    app = extend(true, app, options);
    app.secretSauce = app.appName + ' secret sauce';
    // Initialize Database
    console.verbose('Initializing Databse...');
    getMongoose(app).then(function(mongoose) {
        app.mongoose = mongoose;
    }).catch(reject);

    // Initialize Express/App
    console.verbose('Initializing Express/App...');
    initializeApp(resolve);
    return app;
}

function initializeApp(done) {
    // Initiazlize runtime

    // Log requests
    app.use(console.request());

    app.use(app.cookieParser());
    app.use(app.bodyParser.urlencoded({
        extended: true
    }));
    app.use(app.bodyParser.json());


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


    // DEV locals & debugging settings
    app.locals.appName = app.appName;
    app.locals.resources = app.config.resources;
    app.locals.toShortString = toShortString;
    app.use(function setLocals(req, res, next) {
        app.locals.locals = app.locals;
        app.locals.local = app.config.local;
        app.locals.req = req;
        app.locals.dev = app.config.dev;

        app.locals.pretty = true;
        if (app.config.dev) {
            app.set('env', 'development');
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        } else {
            res.header('Cache-Control', 'public, max-age=9999999');
        }

        req.session.data = {
            url: (req.session.data && req.session.data.url) || '',
            regex: (req.session.data && req.session.data.regex) || '',
            scrap: {
                text: (req.session.data && req.session.data.scrap && req.session.data.scrap.text) || '',
            }
        };

        // This needs to be here. And this needs to be JSONified
        // Variables defined below it aren't localized
        res.locals.session = JSON.parse(JSON.stringify(req.session));
        // res.locals.session = req.session);
        // Below it session variables are killed.

        // volatilization
        req.session.error = null;
        req.session.message = null;

        next();
    });

    // console.debug('__dirname:', __dirname);
    // console.debug('app.config.basedir:', app.config.basedir);

    app.set('view engine', 'jade');
    try {
        var basedirs = [
            app.config.basedir,
            app.config.basedir + '/..',
            __dirname,
        ];
        var basedirsForViews = [];
        basedirs.forEach(function(basedir) {
            basedirsForViews.push(basedir + '/views');
            app.use(require('stylus').middleware(basedir + '/public'));
            app.use(express.static(basedir + '/public'));
            app.use(express.static(basedir + '/client'));
            app.use(app.jadeStatic({
                baseDir: path.join(basedir + '/views/templates'),
                baseUrl: '/templates',
                jade: {
                    pretty: true,
                }
            }));
            app.use(app.jadeStatic({
                baseDir: path.join(basedir + '/client/components'),
                baseUrl: '/components',
                jade: {
                    pretty: true,
                }
            }));
        });
        app.set('views', basedirsForViews);
    } catch (err) {
        console.err(err);
    }
    app.use(app.bodyParser.json());
    app.use(app.bodyParser.urlencoded({
        extended: true
    }));
    app.use(app.cookieParser());
    app.use(app.methodOverride());

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

    app.use(app.passport.initialize());
    app.use(app.passport.session());
    app.use(function(req, res, next) {
        if (req.user)
            res.locals.user = JSON.parse(JSON.stringify(req.user, ['_id', 'username', 'email', 'number']));
        if (req.user && req.user.admin)
            app.locals.dev = app.config.dev = true;
        next();
    });

    // Routes stored in this file (for separation sake)
    // require('./routes')(app);
    // console.debug('app.routes:', app.router.routes);

    app.reAttachDefaultRoutes = function() {
        // Re-attach at the end every time a new route is added at run-time
        var mainRouteExistsFlag = false;
        app._router.stack.forEach(function(route, i, routes) {
            // console.debug('route.handle.name:', route.handle.name);
            switch (route.handle.name) {
                case 'catch404s':
                case 'catchErrors':
                    routes.splice(i, 1);
            }

            if (route.route && route.route.path && route.route.path == '/')
                route.route.stack.forEach(function(route, i, routes) {
                    if (route.handle.name == 'defaultMain')
                        routes.splice(i, 1);
                    else
                        mainRouteExistsFlag = true;
                });
        });

        // default main route /
        if (!mainRouteExistsFlag)
            app.get('/', function defaultMain(req, res, next) {
                res.render('index');
            });

        // catch 404 and forward to error handler
        app.use(function catch404s(req, res, next) {
            var err = new Error('Not Found: ' + (req.method != 'GET' ? (req.method + ' ') : '') + req.path)
            err.status = 404;
            next(err);
        });
        app.use(function catchErrors(err, req, res, next) {
            console.err(err);
            // if (res.headersSent) return;

            var title = 'Something went wrong...';
            var status = err.status || 500;
            var message = err.message;
            if (message.indexOf('.jade:') > -1)
                message = title = 'Jade error';

            res.status(status);

            if (req.headers.accept.indexOf('json') > -1)
                res.json(err.message);
            else
                res.render('error', {
                    title: title,
                    status: status,
                    message: message,
                });
        });
    };
    app.reAttachDefaultRoutes();

    // =======================================
    // All ready for server to start listening
app.server = app.listen(app.get('port'), app.get('ip'), function() {
        console.verbose('Express server listening on',
            app.server.address().address +
            (app.server.address().port == 80 ? '' : (':' + app.server.address().port))
        );
        getSocket(app, function(app) {
            console.log(app.appName, 'Ready!\u0007');
            done(app);
        });
    });

}
