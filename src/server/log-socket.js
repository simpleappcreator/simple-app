var URL = require('url');
var UAparser = require('ua-parser').parse;
var tostr = require('smallilies').tostr;

var socketIoEventsRouter = require('socket.io-events');

module.exports = function Socket(socket, next) {
    var req = socket.request;

    if (socket.id) 
    user += '{' + socket.id.substr(0, 2);
    if (socket.request.sessionID) 
    user += socket.request.sessionID.substr(0, 2);
    user += '} ';

    var Url = URL.parse(req.url);
    if (! ~Url.path.indexOf('socket.io/?')) 
    var url = (Url.host || '') + tostr(Url.path, 100, 5) + tostr(Url.query, 50, 5);

    req.ip = req.headers && req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || req.connection && req.connection.remoteAddress || null;
    req.referer = req.ref = req.headers && req.headers.referer ? URL.parse(req.headers.referer) : null;
    req.useragent = req.ua = req.headers && req.headers['user-agent'] ? UAparser(req.headers['user-agent']).ua : null;

    var ip = req.ip && 'IP:' + req.ip;
    var ref = req.ref && (url ? 'Ref:' : '') + req.ref.host + tostr(req.ref.path, 100, 5) + tostr(req.ref.query, 50, 5);
    var ua = req.ua && 'UA:' + tostr(req.ua.toString(), 20).replace(' ', '');
    var user = req.user && tostr(req.user).replace(/[\[\]\(\)]/g, '');


    var router = socketIoEventsRouter();

    log('connected');
    socket.on('disconnect', log.bind(null, 'disconnected'));
    socket.on('reconnect', log.bind(null, 'reconnected'));

    router.on(function (socket, args, next) {
        var name = args[0], 
        msg = args[1];
        log('on(\'' + name + '\') ' + tostr(msg, 40, 10));
        next();});


    var emit = socket.emit;
    socket.emit = function emitIntercept(name, msg) {
        log('emit(\'' + name + '\' {' + tostr(msg, 40, 10) + '})');
        emit.apply(socket, arguments);};


    function log(msg) {
        var message = 'SOC ';
        if (msg) message += msg + ' ';
        message += '| ';
        if (url) message += url + ' ';
        if (ref) message += ref + ' ';
        message += '| ';
        message += user + ' ';
        message += ip + ' ';
        message += ua + ' ';

        console['verbose'](message);
        // console['verbose']('SOCKET', msg, '|', user, '|', ref, '|', ip, ua);
    }

    router(socket, next);
    // next();
};
//# sourceMappingURL=log-socket.js.map
