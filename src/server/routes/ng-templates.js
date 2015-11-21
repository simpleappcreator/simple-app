var cache = false;

app.get('/ng-templates.js', function (req, res, next) {
    if (dev || !cache) cache = config.resources.getConsolidatedNgTemplatesJS();
    res.header('content-type', 'text/javascript');
    res.status(200).send(cache);});
//# sourceMappingURL=ng-templates.js.map
