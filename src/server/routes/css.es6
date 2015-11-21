var Stylus = Promise.promisifyAll(require('stylus'));
app.get(/\.css/, function(req, res, next) {

    var filename = req.path;
    if (filename.charAt(0) == '/')
        filename = req.path.substr(1);

    Promise.series1([
        getRawCss,
        getRenderedStyl,
    ]).then(send).catch(next);


    function getRawCss() {
        return readFile(filename);
    }

    function getRenderedStyl() {
        return readFile(filename.replace('.css', '.styl'))
            .then(renderStyl);
    }

    function renderStyl(str) {
        return Stylus(str).render();
    }

    function send(css) {
        res.header('content-type', 'text/css');
        res.status(200).send(css);
    }

});

function readFile(filename) {
    return Promise.series1([
        fs.readFileAsync.bind(fs, app.appdir + '/client/public/' + filename, 'utf8'),
        fs.readFileAsync.bind(fs, app.moddir + '/client/public/' + filename, 'utf8'),
        fs.readFileAsync.bind(fs, app.appdir + '/client/components/' + filename, 'utf8'),
        fs.readFileAsync.bind(fs, app.moddir + '/client/components/' + filename, 'utf8'),
        fs.readFileAsync.bind(fs, app.appdir + '/client/' + filename, 'utf8'),
        fs.readFileAsync.bind(fs, app.moddir + '/client/' + filename, 'utf8'),
    ]);
}
