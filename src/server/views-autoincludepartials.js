var Jade = require('jade');

module.exports = jadeAutoInclude;

var cache = {};

function jadeAutoInclude(req, res, next) {
    var locals = res.locals;
    var render = res._render = res.render.bind(res);
    res.render = function renderPatch(view, options, cb) {
        var next = this.req.next;
        options = _.extend(locals, options);
        if (~req.url.indexOf('/components/')) 
        return render.apply(res, arguments);
        if (options.dontincludepartials) 
        return render.apply(res, arguments);

        var partialsCompileFn = getPartialsCompileFn();
        locals.getNgTemplates = getNgTemplates;
        getViewCompileFn(view).then(function (viewCompileFn) {
            var main = viewCompileFn(locals);
            var finalView = '';

            if (config.autoincludepartials !== false) {
                var header = partialsCompileFn.header.compile(locals);
                var footer = partialsCompileFn.footer.compile(locals);
                finalView = header + main + footer;} else 

            finalView = main;

            res.status(200).send(finalView);}).
        catch(next);};

    next();

    function getNgTemplates() {
        var ngTemplates = '';
        Object.keys(config.resources.ngModules).forEach(function (key) {
            var module = config.resources.ngModules[key];
            if (!module.jade) return;
            var fullpath = module.jade;
            var relpath = fullpath.split('/client').pop().replace('.jade', '');
            try {
                var str = Jade.renderFile(module.jade, _.extend({ 
                    filename: fullpath }, 
                locals));
                str = '<script type="text/ng-template" id="' + relpath + '">\n' + str + '</script>';} 
            catch (err) {
                if (dev && config.showNgTemplatesRenderErrs) 
                console.err(err);
                var str = '';}

            ngTemplates += '\n' + str;});

        return ngTemplates;}}

;


function getPartialsCompileFn() {
    var partials = getPartialsRawJade();
    partials.header.compile = Jade.compile(partials.header.str, _.extend({ 
        filename: partials.header.fullpath }, 
    app.locals));
    partials.footer.compile = Jade.compile(partials.footer.str, _.extend({ 
        filename: partials.footer.fullpath }, 
    app.locals));
    return partials;

    function getPartialsRawJade() {
        var partials = {};
        partials.header = tryappcatchmod('header');
        partials.footer = tryappcatchmod('footer');
        return partials;

        function tryappcatchmod(p) {
            p = '/client/views/partials/' + p + '.jade';
            try {
                return { 
                    fullpath: app.appdir + p, 
                    str: fs.readFileSync(app.appdir + p, 'utf8') };} 

            catch (err) {
                return { 
                    fullpath: app.moddir + p, 
                    str: fs.readFileSync(app.moddir + p, 'utf8') };}

            ;}
        ;}
    ;}
;

function getViewCompileFn(view) {
    return getFile(view).then(function (view) {
        return Jade.compile(view.str, _.extend({ 
            filename: view.fullpath }, 
        app.locals));});


    function getFile(view) {
        return Promise.series1([
        readFile.bind(null, app.appdir + '/client/views/' + view + '.jade'), 
        readFile.bind(null, app.moddir + '/client/views/' + view + '.jade')]);


        function readFile(path) {
            return fs.readFileAsync(path, 'utf8').then(function (str) {
                return { 
                    view: view, 
                    fullpath: path, 
                    str: str };});}


        ;}
    ;}
;
















// function getRenderedPartials(options) {
//     var partials = {};
//     partials.defHeader = readViewFileAndRender(config.moddir + '/client/views/partials/header.jade', options);
//     partials.defFooter = readViewFileAndRender(config.moddir + '/client/views/partials/footer.jade', options);
//     partials.appHeader = readViewFileAndRender(config.appdir + '/client/views/partials/header.jade', options);
//     partials.appFooter = readViewFileAndRender(config.appdir + '/client/views/partials/footer.jade', options);
//     return partials;
// }

// function readViewFileAndRender(fullpath, options) {
//     // options = _.extend({}, options);
//     // options.filename = fullpath;
//     return Jade.renderFile(fullpath, options);
// }

// function getViewAndAttachPartials(view) {
//     return Promise.all([
//         readFilePartials(),
//         readFileView(view),
//     ]).spread(function(partials, view) {
//         view.str = view.str.replace(/\!\= .*header/, '');
//         view.str = view.str.replace(/\!\= .*footer/, '');
//         partials.appHeader = partials.appHeader.replace(/\!\= .*header/, partials.defHeader);
//         partials.appHeader = partials.appHeader.replace(/\!\= .*footer/, partials.defFooter);
//         view.str = (partials.appHeader || partials.defHeader) + '\n' + view.str + '\n' + (partials.appFooter || partials.defFooter);
//         return view;
//     });
// }

// function readFileView(view) {
//     var viewsdirs = App.get('views');
//     return Promise.some(viewsdirs.map(function(viewsdir) {
//         return fs.readFileAsync(viewsdir + '/' + view + '.jade', 'utf8').then(function(view) {
//             return {
//                 str: view,
//                 filename: viewsdir + '/' + view + '.jade',
//             };
//         });
//     }), 1, {
//         concurrency: 1
//     }).then(function(views) {
//         return views[0];
//     });
// }


// function readFilePartials() {
//     var partials = {};
//     return Promise.resolve(function() {

//     }).then(function() {
//         return fs.readFileAsync(config.moddir + '/views/partials/header.jade', 'utf8').then(function(header) {
//             partials.defHeader = header;
//         });
//     }).then(function() {
//         return fs.readFileAsync(config.moddir + '/views/partials/footer.jade', 'utf8').then(function(footer) {
//             partials.defFooter = footer;
//         });
//     }).then(function() {
//         return fs.readFileAsync(config.appdir + '/views/partials/header.jade', 'utf8').then(function(header) {
//             partials.appHeader = header;
//         }).catch(function() {
//             partials.appHeader = null;
//         });
//     }).then(function() {
//         return fs.readFileAsync(config.appdir + '/views/partials/footer.jade', 'utf8').then(function(footer) {
//             partials.appFooter = footer;
//         }).catch(function() {
//             partials.appFooter = null;
//         });
//     }).then(function() {
//         return partials;
//     });
// }
//# sourceMappingURL=views-autoincludepartials.js.map
