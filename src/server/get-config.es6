console.verbose('Loading configs...');

config = app.config = app.settings = app.settings || {};

moddir = config.moddir = Path.join(__dirname, '..') + '';
appdir = config.appdir = Path.dirname(require.main.filename) + '';

_.extend(config, require('./config.default'));
_.extend(config, process.env);
try {
    let path = Path.join(appdir, '/config');
    _.extend(config, require(path));
    console.log('Config loaded from', path);
} catch (err) {}
try {
    let path = Path.join(appdir, '../config');
    _.extend(config, require(path));
    console.log('Config loaded from', path);
} catch (err) {}
try {
    let path = Path.join(appdir, '/lib/config');
    _.extend(config, require(path));
    console.log('Config loaded from', path);
} catch (err) {}
try {
    let path = Path.join(appdir, '/server/config');
    _.extend(config, require(path));
    console.log('Config loaded from', path);
} catch (err) {}


for (let setting in config) {
    config[setting.toLowerCase()] = config[setting];
    setting = setting.toLowerCase();
    if (setting.indexOf('openshift_') > -1) {
        config[setting.substr(10)] = config[setting];
        setting = setting.substr(10);
    }
    if (setting.indexOf('nodejs_') > -1) {
        config[setting.substr(7)] = config[setting];
        setting = setting.substr(7);
    }

    switch (true) {
        case setting == 'app':
        case setting == 'name':
        case setting == 'appname':
        case setting == 'app_name':
            // if (config[setting] == defaultName) break;
            config['name'] =
                config['app'] =
                config['appname'] =
                config['app_name'] =
                config['appName'] =
                config[setting];
    }

    switch (true) {
        case (setting == 'live'):
        case (setting == 'server'):
        case (setting == 'prod'):
        case (setting == 'production'):
            prodEnv(setting, config[setting]);
            break;
        case (setting == 'local'):
        case (setting == 'dev'):
        case (setting == 'devel'):
        case (setting == 'development'):
            devEnv(setting, config[setting]);
            break;
        case (setting == 'node_env'):
        case (setting == 'env'):
            switch (config[setting]) {
                case undefined:
                case '':
                case 'live':
                case 'server':
                case 'prod':
                case 'production':
                    prodEnv(setting, config[setting]);
                    break;
                case 'local':
                case 'dev':
                case 'devel':
                case 'development':
                    devEnv(setting, config[setting]);
                    break;
            }
    }

    switch (true) {
        case (setting == 'app_dns'):
        case (setting == 'server_host'):
        case (setting == 'http_host'):
        case (setting == 'server_name'):
        case (setting == 'host_name'):
        case (setting == 'domain_name'):
        case (setting == 'serverhost'):
        case (setting == 'httphost'):
        case (setting == 'servername'):
        case (setting == 'hostname'):
        case (setting == 'domainname'):
        case (setting == 'domainame'):
        case (setting == 'server'):
        case (setting == 'domain'):
        case (setting == 'host'):
            var hostname = config[setting];
            if (hostname.slice(0, 4) != 'http' || hostname.slice(0, 2) != '//')
                hostname = 'http://' + hostname;
            if (hostname.slice(-1) == '/')
                hostname = hostname.slice(0, -1);
            config[setting] =
                config['app_dns'] =
                config['server_host'] =
                config['http_host'] =
                config['server_name'] =
                config['host_name'] =
                config['domain_name'] =
                config['serverhost'] =
                config['httphost'] =
                config['servername'] =
                config['hostname'] =
                config['domainname'] =
                config['domainame'] =
                config['server'] =
                config['domain'] =
                config['host'] =
                config['serverHost'] =
                config['hostServer'] =
                hostname;
    }

    switch (true) {
        case (setting == 'ga'):
        case (setting == 'googleanalyticstrackingcode'):
            config.trackers = true;
            var googleanalyticstrackingcode = config[setting];
            config[setting] =
                config['ga'] =
                config['googleanalyticstrackingcode'] =
                googleanalyticstrackingcode;
    }

}

var env;

function prodEnv(setting, value) {
    // console.debug('prodEnv', setting, value);
    if (value === false) return;
    env = 'prod';
}

function devEnv(setting, value) {
    // console.debug('devEnv', setting, value);
    env = env || 'dev';
}

config['node_env'] = config['env'] = env == 'prod' ? 'production' : 'development';
config.prod = env == 'prod';
dev = config.dev = !config.prod
    // console.debug('dev:', dev);

try {
    _.extend(config, require(appdir + '/config'));
} catch (err) {}


if (!config.hostname) config.hostname = 'http://localhost';
hostname = config.hostname;

// config.Name = _.startCase(config.name);
config.Name = config.name;
config.nameslug = _.camelCase(config.name).toLowerCase();

if (!config.port) config.port = 80;

_.extend(app, config);
