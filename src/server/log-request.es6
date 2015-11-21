var onFinished = require('on-finished');
var UAparser = require('ua-parser').parse;

var requestTimeout = 30;

module.exports = function Request(req, res, next) {

    if (res.statusCode == 304) return;
    next();

    if (dev && config.suppressRequestLogs) {
        if (req.url.match('.(css|js)$')) return;
        if (req.url.match('.(css|js)?')) return;
        if (req.url.match('public/vendor')) return;
    }

    req.time = new Date();

    res.ip = ((req.headers && req.headers['x-forwarded-for']) || req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress)) || null;
    res.referer = res.ref = (req.headers && req.headers.referer) ? URL.parse(req.headers.referer) : null;
    res.useragent = res.ua = (req.headers && req.headers['user-agent']) ? UAparser(req.headers['user-agent']).ua : null;


    onFinished(res, function(err) {
        // Double onFInished! Double onFInished!
        // So that if an onFinished is also used in application,
        // this onFinished will execute after that.
        // console.log('even 1st onf');
        onFinished(res, function(err2) {
            // console.log('even 2nd onf');
            log(err || err2, req, res);
        });
    });
    res.logTimeout = setTimeout(function() {
        // console.log('even timeout');
        log(new Error('timeout'), req, res);
    }, requestTimeout * 1000);

};

function log(err, req, res) {
    // console.log('even log?');
    clearTimeout(res.logTimeout);

    var method = req.method && req.method.toUpperCase();
    var Url = URL.parse(req.url);
    var url = (Url.host || '') + tostr(Url.path, 100, 5) + tostr(Url.query, 50, 5);

    var info = req.info && ('| ' + tostr(req.info, 50));
    if (err && err.message) err = err.message;
    err = (err || req.err) && ('| ' + tostr(req.err || err, 50));

    var user = req.user && tostr(req.user).replace(/[\[\]\(\)]/g, '');
    var ip = res.ip && ('IP:' + res.ip);
    var ref = res.ref && ('Ref:' + res.ref.host + tostr(res.ref.path, 100, 5) + tostr(res.ref.query, 50, 5));
    var ua = res.ua && ('UA:' + tostr(res.ua.toString(), 20).replace(' ', ''));

    var status = '';
    if (res.statusCode_)
        status += res.statusCode_;
    else if (res.statusCode)
        status += res.statusCode;
    else if (err.message == 'timeout')
        status += 'timeout'
    else
        status += '???'

    var time = new Date() - req.time || 0
    if (time > 9999)
        time = (time / 1000).toFixed(0) + 's';
    else if (time > 1000)
        time = (time / 1000).toFixed(1) + 's';
    else
        time = time + 'ms';

    var level = 'verbose';
    switch (true) {
        case (!res._header):
        case (!res.statusCode):
        case (res.statusCode > 400):
        case (isNaN(res.statusCode)):
            level = 'error';
    }

    var message = '';
    message += method + ' ';
    message += status + ' ';
    message += time + ' ';

    if (url) message += url + ' ';

    if (info) message += info + ' ';
    if (err) message += err + ' ';

    // message += '| ';
    if (ref) message += ref + ' ';
    message += '| ';
    if (ip) message += ip + ' ';
    if (ua) message += ua + ' ';
    if (user) message += user + ' ';

    console[level](message);

}
