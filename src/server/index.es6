console.log('Initializing...');

// General utils
require('unclog');

// app core (express)
express = require('express');
app = module.exports = express();
app.express = express;
app.Router = express.Router().bind(express);

// Config
require('./get-config');
require('./get-resources');

// MongoDB
require('./mongoose');

// Express Addons
compression = require('compression')();
bodyParser = require('body-parser');
connectRestreamer = require('connect-restreamer');
methodOverride = require('method-override');
stylus = require('stylus');
nib = require('nib')();
jade = require('jade');

app.cookieParser = require('cookie-parser');
app.secretSauce = app.get('name') + ' secret sauce';
app.session = require('express-session');

// Passport & User Auth
require('./passport');


// Middlewares
locals = app.locals.locals = app.locals;

// Make utils available in Jade
locals.tostr = tostr;
locals.moment = moment;
locals._ = _;

// DEV locals & debugging settings
locals.name = config.name;
locals.nameslug = config.nameslug;
locals.Name = config.Name;
locals.title = config.Name;
locals.Title = config.Name;
locals.config = config;
locals.resources = config.resources;
locals.dev = dev;

locals.trackers = config.trackers;
if (config.ga)
    locals.ga = locals.googleanalyticstrackingcode = config.ga;


if (dev) {
    locals.pretty = true;
    app.use(function setDevHeaders(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    });
    if (config.webpack) {
        try {
            const webpackDevMiddleware = require('webpack-dev-middleware');
            const webpack = require('webpack');
            const webpackConfig = config.webpack;
            const compiler = webpack(webpackConfig);
            app.use(webpackDevMiddleware(compiler, webpackConfig));
            console.log('Webpack middleware activated');
        } catch (err) {
            console.error(err);
        }
    }
} else {
    app.use(compression);
    locals.cache = true;
}


// make `app.set()` case-insensitive
(function(set) {
    set = set.bind(app);
    app.set = function(setting) {
        setting = setting.toLowerCase();
        return set.apply(app, arguments);
    }
})(app.set);


app.use(app.cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// app.use(connectRestreamer());

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


app.use(require('./log-request'));

require('./routes/minified');
require('./routes/statics');
require('./routes/css');
require('./routes/ng-templates');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(app.cookieParser());
app.use(methodOverride());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    if (!req.user)
        new app.mongoose.AnonUser({}).save(function(err, user) {
            req.logIn(user, next);
        });
    else next();
});


// Middlewares before Routes
app.use(function(req, res, next) {
    var locals = _.extend(res.locals, app.locals);
    var session = req.session;

    // Set Variables
    locals.req = req;
    locals.res = res;
    locals.locals = locals;
    locals.session = session;
    req.json = req.headers.accept && req.headers.accept.match(/json/) || req.url.match(/json$/) ? true : false;
    var query = locals.query = req.query;
    for (let key in query)
        if (query[key] == '')
            query[key] = true;
    locals.params = req.params;
    locals.meta = _.extend({}, query, locals.params);

    // Set User
    // locals.user = req.user;
    locals.user = req.user || {
        anon: true,
        name: 'AnonUser',
        _id: -1,
    };

    // Last page
    session.lastpage = session.lastpage || '/';
    if (req.method == 'GET' && !req.url.match(/test|login|register|logout|admin|sudo|\./))
        session.lastpage = req.url;

    // volatile session error
    if (session.err) {
        locals.err = session.err.message || session.err;
        delete session.err;
    }

    // setTitle
    if (req.path.substr(1).length) {
        locals.Title = _.startCase(req.path.substr(1));
        locals.title = _.startCase(req.path.substr(1)) + ' | ' + locals.title;
    }
    locals.path = req.path.split('/')[1];
    if (!locals.path.length) locals.path = '/';


    // Helpers functions on req
    req.nextErr = nextErr;

    next();
});

function nextErr(status, message) {
    var req = this,
        res = req.res,
        next = req.next;
    if (!message && status) {
        message = status;
        status = 500;
    }
    var err = new Error(message);
    err.status = status;
    res.status(status);
    req.next(err);
    return err;
}

if (config.aip || config.autoincludepartials)
    app.use(require('./views-autoincludepartials'));

app.set('view engine', 'jade');
app.set('views', app.moddir + '/client/views');
app.set('views', app.appdir + '/client/views');

// patch res.redirect
app.use(function(req, res, next) {
    res._redirect = res.redirect;
    res.redirect = function res_redirect_patch(url, err) {
        if (err)
            req.session.err = err.message || (err + '');
        else
            delete req.session.err;
        res._redirect(url || req.session.lastpage || '/');
    };
    next();
});








// Default Routes
var defaultRoutes = [
    ['all', '/', defaultHomeRoute],
    // ['get', '/*', jadeViews],
    ['all', '/login', defaultLoginRoute],
    ['all', '/login/:provider/:return?', defaultThirdPartyAuthRoute],
    ['all', '/logout', defaultLogoutRoute],
    ['all', '/profile', defaultUserProfile],
    ['use', catch404s],
    ['use', catchErrors],
];

function defaultHomeRoute(req, res, next) {
    if (res.headersSent) return;
    req.info = 'SimpleApp default route';
    res.render('index');
}

function jadeViews(req, res, next) {
    var path = req.path.substr(1);
    if (~config.resources.jadeViews.indexOf(path))
        return res.render(path);
    if (~config.resources.jadeViews.indexOf(path = path.replace('.html', '')))
        return res.render(path);
    next();
}


function defaultLoginRoute(req, res, next) {
    if (!req.body || !Object.keys(req.body).length) return render();
    if (req.user && req.user.admin && config.loginadminbackdoor) var backdoor = true;
    var User = app.User || app.mongoose.AnonUser;
    console.debug('req.body:', req.body);
    User.findOrCreate(req.body, function(err, user) {
        if (!user) return render(err);
        req.logIn(user, function(err) {
            if (err) render(err);
            else res.redirect();
        });
    }, backdoor);

    function render(err) {
        if (err) res.locals.err = err.message;
        res.render('login');
    };
}

function defaultThirdPartyAuthRoute(req, res, next) {
    if (!req.params.return)
        req.session.googleAuthFlag = true;
    else if (!req.session.googleAuthFlag)
        console.debug('how dare you?');
    else {
        console.debug('cool!');
        req.session.googleAuthFlag = false;
    }

    var provider = req.params.provider;
    var scope = [];
    switch (provider) {
        case 'google':
            scope = ['profile', 'email'];
            break;
        case 'facebook':
            scope = ['user_status', 'user_checkins'];
            break;
        case 'twitter':
            scope = [];
            break;
        default:
            return next();
    };
    if (!req.params.return)
        passport.authenticate(provider, {
            scope: scope
        })(req, res, next);
    else passport.authenticate(provider, {
        successRedirect: req.session.lastpage || '/',
        failureRedirect: '/login'
    })(req, res, next);
}




function defaultLogoutRoute(req, res, next) {
    if (res.headersSent) return;
    req.info = 'SimpleApp default logout route';
    req.logout();
    res.redirect();
}

function defaultUserProfile(req, res, next) {
    var user = req.user;
    if (user.anon) return req.nextErr(401, 'For logged in users only');
    var update = req.body;
    if (update instanceof Array) update = update[0];
    if (update && Object.keys(update).length) {
        delete update.admin;
        delete update.anon;
        delete update.author;
        delete update.enabled;
        delete update.verified;
        delete update.id;
        _.merge(user, update);
        if (update.password && update.password.length)
            user.savePassword(update.password);
        user.saveAsync(render).catch(next);
    } else render(false, user);

    function render(err, user) {
        if (!user) return next(err || new Error('Unable to get/save user'));
        res.locals.user = user;
        if (req.json) res.json(user);
        else res.render('profile');
    }
}

function catch404s(req, res, next) {
    var err = new Error('Not Found: ' + (req.method != 'GET' ? (req.method + ' ') : '') + req.path)
    err.status = err.status || 404;
    next(err);
}

function catchErrors(err, req, res, next) {
    if (res.headersSent) return;

    if (!(err instanceof Error))
        err = new Error(err);

    if (err.message.match('Failed to lookup view')) {
        err = new Error('Not Found: ' + (req.method != 'GET' ? (req.method + ' ') : '') + req.path)
        err.status = 404;
    }

    var status = res.statusCode = res.statusCode_ = err.status || 500;
    var title = 'Something went wrong';
    if (status == 404)
        title = '404 Not found';
    title += ' - ' + res.locals.title;

    var message = err.message;
    var msg = message.split(/[\n\r]/).shift();

    req.err = msg || message;
    res.status(status);

    res.locals.title = title;
    res.locals.status = status;
    res.locals.message = !dev && msg ? msg : message;
    res.locals.err = err;

    if (req.json) res.status(status).json(err.message);
    else res.status(status).render('error');

    if (status != 404)
        console.error(err);
}


// Attach-reattach Default Routes
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
    try {
        if (typeof arguments[0] != 'function' && typeof arguments[1] != 'function')
            throw new Error('Not a middleware');
    } catch (err) {
        return value;
    };
    try {
        var reqPath = arguments[0];
        if (typeof arguments[1] != 'function') throw new Error('No middleware');
        if (reqPath.charAt(0) != '/') throw new Error('Not a route');
        if (~reqPath.indexOf('/:')) throw new Error('Variable route');
        if (~reqPath.indexOf('admin')) throw new Error('admin route');
        if (~reqPath.indexOf('logs')) throw new Error('misc admin route');
        if (sitemap.urls.map(function(urlItem) {
                return urlItem.url;
            }).indexOf(reqPath) > -1) throw new Error('Duplicate route');
        if (~reqPath.indexOf('sitemap')) throw new Error('Sitemap for sitemap route');
        sitemap.add(reqPath);
    } catch (err) {};
    defaultRoutesReModifier();
    return value;
};

defaultRoutesReModifier(); // at least once;

function defaultRoutesReModifier() {
    removeRoutes(defaultRoutes);
    addRoutes(defaultRoutes);
}


function addRoutes(routes) {
    routes.forEach(function addRoute(route) {
        app['_' + route[0]].apply(app, route.slice(1));
    });
}


function removeRoutes(routes) {
    var handlerNames = routes.map(function(route) {
        return route[route.length - 1].name;
    });
    app._router.stack.forEach(function removeMiddlewares(route, i, routes) {
        if (~handlerNames.indexOf(route.handle.name))
            routes.splice(i, 1);
        if (route.route)
            route.route.stack.forEach(removeMiddlewares);
    });
}

app.removeDefaultMiddlewares = function removeDefaultMiddlewares() {
    app._router.stack.forEach(removeMiddlewares);
}



// Helper Route Middlewares

app.reqAnonUser = function reqAnonUser(req, res, next) {
    if (!req.user) return new app.mongoose.AnonUser({}).save(function(err, user) {
        req.login(user);
        next();
    });
    next();
};

app.isLoggedIn = app.reqUser = function reqUser(req, res, next) {
    if (!req.user) return res.status(401).redirect('/login');
    if (req.user.anon) return res.status(401).redirect('/login');
    next();
};

app.isAdmin = app.reqAdmin = function reqAdmin(req, res, next) {
    if (!req.user) return res.status(401).redirect('/login');
    switch (true) {
        case req.user.admin:
        case (req.user.group && req.user.group == 'admin'):
            return next();
        default:
            var err = new Error('You need to be Admin');
            err.status = 403;
            next(err);
    };
};

app.isLoggedOut = app.reqNotUser = function reqNotUser(req, res, next) {
    if (req.user) return res.status(307).redirect('logout');
    next();
};


// Sitemaps
try {
    if (!config.hostname) throw new Error('Set \'hostname\'');
    var sitemap = app.sitemap = require('sitemap').createSitemap({
        hostname: config.hostname,
        cacheTime: 600000, // 600 sec - cache purge period
    });
    var sitemap_add_org = sitemap.add;
    sitemap.add = function sitemap_add_patch(urlItem) {
        if (typeof urlItem == 'string') urlItem = {
            url: urlItem
        };
        if (!urlItem.lastmodISO)
            urlItem.lastmodISO = (new Date()).toISOString();
        return sitemap_add_org.apply(sitemap, arguments);
    };
    sitemap.render = function sitemap_render(req, res, next) {
        try {
            var sitemap_toString = sitemap.toString();
            res.header('Content-Type', 'application/xml');
            res.status().send(sitemap_toString);
        } catch (err) {
            console.error(err);
            next(err);
        }
    };
    app._get('/sitemap', sitemap.render);
    app._get('/sitemap.xml', sitemap.render);
} catch (err) {
    (function() {
        function sitemap_err(req, res, next) {
            next(err);
        };
        app._get('/sitemap', sitemap_err);
        app._get('/sitemap.xml', sitemap_err);
    })();
}







// =======================================
// All ready for server to start listening

var resolve;
var ready = new Promise(function() {
    resolve = arguments[0];
});
app.ready = ready.then.bind(ready);
app.ready.then = ready.then.bind(ready);


app.globalize = function globalize() {
    // var globalize = require('smallilies').globalize;
    // globalize('app', app);
    // globalize('express', express);
    // globalize('dev', dev);
    // globalize('config', config);
    // globalize('appName', config.appName);
    // globalize('hostname', app.hostname);
    // globalize('passport', passport);
    // globalize('mongoose', mongoose);
    // globalize('ObjectId', mongoose.Schema.Types.ObjectId);
    // globalize('io', io);
    return app;
};

app.BasicCrud = require('./basic-crud');

IP = app.get('ip');
PORT = app.get('port');
IP_PORT = IP + (PORT == 80 ? '' : (':' + PORT));

function repl(rl) {
    rl.question('', function(command) {
        command = command.replace(/[\r\n]+/g, ' ');
        if (command.match(/^q$/)) return process.exit(0);
        console.log('$>', command);
        try {
            console.log(eval(command));
        } catch (err) {
            console.err(err);
        }
        repl(rl);
    });
}
if (dev || config.repl) repl(readline.createInterface({
    input: process.stdin,
    output: process.stdout,
}));

if (dev && config.browsersync) {
    var browserSync = require('browser-sync').create();
    browserSync.init({
        logSnippet: false,
        // proxy: IP_PORT,
        host: IP,
    });
    browserSync.watch('views/**/*.*').on('change', browserSync.reload);
    browserSync.watch('client/**/*.*').on('change', function(file) {
        var filename = Path.basename(file);
        var extname = Path.extname(file);
        if (extname == '.styl') filename = filename.replace('.styl', '.css');
        // if (extname == '.css') return;
        browserSync.reload(filename);
    });
    browserSync.watch('server/**/*.*').on('change', process.exit);
}


app.server = app.listen(PORT, IP, function(err) {
    console.verbose('Express server listening on', IP_PORT);
    app.mongoose.connection.on('open', function() {
        console.log(app.Name, 'Ready!', (dev ? '(development mode)' : ''), '\u0007\u0007');
        resolve();
    });
});
var io = require('./socket');

process.on('uncaughtException', function(err) {
    if (err.stack.match('AssertionError: false == true')) return console.err(err.stack);
    setTimeout(function() {
        console.error(err);
        console.error(err.stack);
        console.error('Uncaught Exception. Exiting...\u0007\u0007');
        process.exit(1);
    }, 1000);
});
