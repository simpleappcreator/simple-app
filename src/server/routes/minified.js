app.get('/.min.js', minified);
app.get('/.min.css', minified);

function minified(req, res, next) {
    var ctx = req.path.split('.').pop();
    config.resources.getMinified[ctx].then(send);

    function send(str) {
        res.header('content-type', 'text/' + (ctx == 'css' ? 'css' : 'javascript'));
        res.status(200).send(str);
    }
}
