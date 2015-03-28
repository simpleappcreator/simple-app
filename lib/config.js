var app = require('./');
var config = app.config = module.exports = {};

var console = require('unclog');
var Path = require('path');
var extend = require('extend');

var basedir = config.basedir = new String(Path.dirname(require.main.filename));
basedir.resolve = function(relative) {
    if (('' + relative).indexOf('lib') != -1) return '';
    return Path.relative.apply(null, [
        Path.join('' + this),
        Path.join('' + relative),
    ]);
    return relative.replace(this, '').replace(Path.join(this + '/..'), '');
}

var defaultName = 'SimpleApp';
config.name = defaultName;

function getAppTitle() {
    var name = app.get('name');
    if (!name) name = defaultName;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
};
var getAppTitleGetter = {};
getAppTitleGetter.get = getAppTitleGetter.set = getAppTitle;
Object.defineProperty(config, 'title', getAppTitleGetter);
Object.defineProperty(app.settings, 'title', getAppTitleGetter);


console.verbose('Loading configs...');

config = extend(true, config, process.env);
[
    Path.join(basedir + '/config'),
    Path.join(basedir + '/server/config'),
    Path.join(basedir + '/../config'),
    Path.join(basedir + '/../server/config'),
].forEach(function(basedir) {
    try {
        config = extend(true, config, require(basedir));
        var log = config.basedir.resolve(basedir);
        if (log)
            console.verbose(' ', log);
    } catch (err) {}
});
// console.debug('config:', config.port);

for (setting in config) {
    config[setting.toLowerCase()] = config[setting];
    setting = setting.toLowerCase();
    if (setting.indexOf('openshift_nodejs_') > -1)
        config[setting.substr(17)] = config[setting];

    switch (true) {
        case setting == 'app':
        case setting == 'name':
        case setting == 'appname':
            if (config[setting] == defaultName) break;
            config['name'] = config['app'] = config['appname'] = config['appName'] = config[setting];
    }

    switch (true) {
        case (setting == 'node_env'):
        case (setting == 'env'):
            switch (config[setting].toLowerCase()) {
                case 'local':
                case 'dev':
                case 'devel':
                case 'development':
                    config['node_env'] = config['env'] = 'development';
                    config.dev = true;
                    break;
                case 'live':
                case 'server':
                case 'prod':
                case 'production':
                    config['node_env'] = config['env'] = 'production';
                    config.dev = false;
                    break;
            }
    }
    switch (true) {
        case (setting == 'server_host'):
        case (setting == 'http_host'):
        case (setting == 'server_name'):
        case (setting == 'server'):
        case (setting == 'host'):
            var server = config[setting];
            if (server.slice(0, 4) != 'http' && server.slice(0, 2) != '//')
                server = 'http://' + server;
            if (server.slice(-1) == '/')
                server = server.slice(0, -1);
            config[setting] =
                config['server_host'] =
                config['http_host'] =
                config['server_name'] =
                config['server'] =
                config['host'] =
                config['serverHost'] =
                config['hostServer'] =
                server;
    }
}
if (typeof(config.dev) == 'undefined')
    switch (true) {
        case (typeof(config.remote) != 'undefined'):
        case (typeof(config.c9_user) != 'undefined'):
        case (typeof(config.openshift_app_name) != 'undefined'):
            config['node_env'] = config['env'] = 'production';
            config.dev = false;
            break;
        default:
            config['node_env'] = config['env'] = 'development';
            config.dev = true;
    }


if (!config.port) config.port = 80;

var getResources = require('./get-resources');
config.resources = getResources([
    Path.join(basedir + ''),
    Path.join(basedir + '/..'),
    Path.join(__dirname + ''),
]);
