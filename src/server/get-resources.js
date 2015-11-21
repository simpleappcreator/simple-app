var Wrench = require('wrench');
var UglifyJS = require('uglify-js');
var Stylus = require('stylus');
var Nib = require('nib')();
var CleanCSS = require('clean-css');
var Jade = require('jade');

var display = config.minify ? true : false;

var minificationTimes = {};

var resources = config.resources = module.exports = {};
var pub = resources.public = {};
var main = pub.main = {};
var vendor = pub.vendor = {};
var ngModules = resources.ngModules = {};
var views = resources.views = {};
var minified = resources.minified = {};

ngModules.getModules = function () {
    var modules = [];
    for (var key in this) {
        if (this[key].js) 
        modules.push(key);}
    return modules;};


console.verbose('Loading resources...');

// Read and concat all app+module's client-side files
var files = readFiles(config.moddir).concat(readFiles(config.appdir));
// console.debug(files);
function readFiles(basepath) {
    basepath = basepath + '/client/';
    return Wrench
    // read all files and directories recursively
    .readdirSyncRecursive(basepath)
    // keep only files (with a dot.)
    .reduce(function (files, file) {return files.concat(~file.indexOf('.') ? [file] : []);}, [])
    // prepend basepath
    .map(function (rel) {return basepath + rel;})
    // normalize path
    .map(function (file) {return Path.join(file).replace(/\\/g, '/');});}


// Categorize by folder
files.forEach(function (fullpath) {
    var pkg = {};
    var filename = pkg.filename = Path.basename(fullpath);
    var ext = Path.extname(filename).substr(1);
    if (ext == 'es6') return;
    var basename = pkg.basename = Path.basename(filename, '.' + ext);
    var baseName = _.camelCase(basename);
    var match, cat;
    switch (true) {
        case !! ~fullpath.indexOf('/client/views/'):
            views[filename] = views[filename] || fullpath;
            return;
        case !! ~fullpath.indexOf('/client/ng-modules/'):
            ngModules[baseName] = ngModules[baseName] || {};
            ngModules[baseName][ext] = ngModules[baseName][ext] || fullpath;
            ngModules[baseName][ext] = fullpath || ngModules[baseName][ext];
            return;
        case !!(match = fullpath.match('/client/public/(main|vendor)/(.*)/' + filename)):
            cat = pub[match[1]][match[2]] = pub[match[1]][match[2]] || [];
            cat.push(fullpath);
            // cat[filename] = cat[filename] || fullpath;
            return;}
    ;});

// console.debug('\n\n%s\n\n', JSON.stringify(resources, null, 1));


// Sort
main.css = main.css.sort(sorter);
vendor.css = vendor.css.sort(sorter);
main.js = main.js.sort(sorter);
vendor.js = vendor.js.sort(sorter);
// console.debug('\n'+main.css.join('\n'));
// console.debug('\n'+vendor.css.join('\n'));
// console.debug('\n'+main.js.join('\n'));
// console.debug('\n'+vendor.js.join('\n'));
function sorter(a, b) {
    var order = 0;
    order = Path.basename(a) > Path.basename(b) ? 1 : -1;
    [
    'polyfill', 
    'jquery.js', 
    'angular.js', 
    'create-ng-directive.js', 
    'lodash', 
    'modernizr', 
    'snap.svg', 
    'jquery.flot.js', 
    'bootstrap.css', 
    'bootstrap', 
    'reset', 
    'jquery', 
    'angular', 
    'common', 
    'uniform', 
    'basic', 
    'modern', 
    'modern-theme', 
    'vendor', 
    'socket', 
    'ng-modules', 
    'root.js', 
    'app.js', 
    'node_modules|simple-app'].
    reverse().map(function (str) {return order = match(str);});

    return order;

    function match(str) {
        return a.match(str) ? -1 : b.match(str) ? 1 : order;}}




// Consolidate ng-templates in Script templates.js
// Consolidate ng-templates
resources.getConsolidatedNgTemplatesJS = function () {
    var ngTemplatesJade = 'ngTemplates = angular.module(\'ngTemplates\', []);\n';
    for (var key in ngModules) {(function (key, module, ngModules) {
            if (!module.jade) return;
            var fullpath = module.jade;
            var relpath = fullpath.split('/client').pop().replace('.jade', '');
            var str = fs.readFileSync(fullpath, 'utf8');
            str = Jade.render(str, locals);
            str = 'ngTemplates.run(($templateCache)=>$templateCache.put(\'' + relpath + '\',`' + str + '`))';
            ngTemplatesJade += '\n' + str + '\n';})(
        key, ngModules[key], ngModules);}
    // console.debug(ngTemplatesJade);
    ngTemplatesJade += '\n//\n// ng-templates --END--';
    return ngTemplatesJade;};



// console.debug('\n' + JSON.stringify(resources, null, 1));
// Consolidate ng-templates
resources.getConsolidatedNgTemplatesJadeFn = function () {
    var str = getConsolidatedNgTemplatesJade();
    // console.debug(str);
    var fn = Jade.compile(str, locals);
    return fn;

    function getConsolidatedNgTemplatesJade() {
        var ngTemplatesJade = '// ng-templates --begin-- \n//';
        for (var key in ngModules) {(function (key, module, ngModules) {
                if (!module.jade) return;
                var fullpath = module.jade;
                var str = fs.readFileSync(fullpath, 'utf8');
                var relpath = fullpath.split('/client').pop().replace('.jade', '');
                str = '\n<script type="text/ng-template" id="' + relpath + '">\n' + str + '</script>\n';
                ngTemplatesJade += str;})(
            key, ngModules[key], ngModules);}
        // console.debug(ngTemplatesJade);
        ngTemplatesJade += '\n//\n// ng-templates --END--';
        return ngTemplatesJade;}};



resources.getConsolidatedNgTemplates = function () {
    return jades().map(function (o) {
        o.fn = Jade.compile(o.str, locals);
        return o;});


    function jades() {
        var jades = [];
        for (var key in ngModules) {
            var _module = ngModules[key];
            if (!_module.jade) continue;
            var o = {};
            o.fullpath = _module.jade;
            o.str = fs.readFileSync(o.fullpath, 'utf8');
            o.relpath = o.fullpath.split('/client').pop().replace('.jade', '');
            o.str = '<script type="text/ng-template" id="' + o.relpath + '">\n' + o.str + '</script>';
            jades.push(o);}

        return jades;}};




// Minify
// console.debug('\n' + JSON.stringify(resources, null, 1));
if (!dev) {
    resources.getMinified = {};
    resources.getMinified.js = new Promise(function (resolve) {
        return resolve(minifyJS());});

    resources.getMinified.css = new Promise(function (resolve) {
        return resolve(minifyCSS());});}



function minifyJS() {
    console.verbose('Minifying JS...');
    // consolidate
    var str = '';
    vendor.js.forEach(function (fullpath) {
        str += '\n' + fs.readFileSync(fullpath, 'utf8') + '\n';});

    main.js.forEach(function (fullpath) {
        str += '\n' + fs.readFileSync(fullpath, 'utf8') + '\n';});

    for (var key in ngModules) {
        if (ngModules[key].js) 
        str += '\n' + fs.readFileSync(ngModules[key].js, 'utf8') + '\n';}
    // minify
    var minifiedJS = UglifyJS.minify(str, { 
        // outSourceMap: mapPath,
        // mangle: (topdir != 'client'),
        mangle: false, 
        fromString: true }).
    code;
    console.verbose('JS minified! %s => %s (%s)', calcSize(str), calcSize(minifiedJS), calcDiff(minifiedJS, str));
    return minifiedJS;}



function calcSize(str) {
    var len = str.length;
    var bytes = len;
    var kb = parseInt(bytes / 1024);
    if (kb < 1000) 
    return kb + 'kB';
    var mb = parseInt(kb / 1024);
    return mb + 'mb';}



function calcDiff(small, big) {
    small = small.length;
    big = big.length;
    var ratio = small / big;
    var percent = ratio * 100;
    if (percent < 1) 
    return percent.toFixed(2) + '%';
    return parseInt(percent) + '%';}


function minifyCSS() {
    var vendor = minifyVendorCSS();
    var main = minifyStylus();
    return vendor + main;}


function minifyVendorCSS() {
    return vendor.css.reduce(function (combined, fullpath) {
        // console.log('fullpath:', fullpath);
        var css = fs.readFileSync(fullpath, 'utf8');
        var minified = css;
        // var minified = new CleanCSS({
        //     keepSpecialComments: 0
        // }).minify(css).styles;
        minified = '\n/* fullpath: ' + fullpath + ' */\n' + minified;
        combined += minified;
        return combined;}, 
    '');
    // // Consolidate
    // var css = '';
    // vendor.css.forEach(function(fullpath) {
    //     console.log('fullpath:', fullpath);
    //     css += '\n' +
    //         ' /* fullpath: ' + fullpath + ' */' + '\n' +
    //         fs.readFileSync(fullpath, 'utf8') +
    //         '\n';
    // });
    // // minify
    // return new CleanCSS({
    //     // keepSpecialComments: 1
    // }).minify(css).styles;
}

function minifyStylus() {
    // return main.css.reduce(function(combined, fullpath){
    //     console.log('fullpath:', fullpath);
    //     var styl = fs.readFileSync(fullpath, 'utf8');
    // },'');
    var cssMiniStr = '';
    var stylStr = '';
    // Consolidate
    main.css.forEach(function (fullpath) {
        stylStr += '\n' + fs.readFileSync(fullpath, 'utf8') + '\n';});

    for (var key in ngModules) {
        if (ngModules[key].styl) 
        stylStr += '\n' + fs.readFileSync(ngModules[key].styl, 'utf8') + '\n';}
    // Compile & minify
    Stylus(stylStr).set('compress', true).render(function (err, css) {
        if (err) console.err(err);
        cssMiniStr = css;});

    return cssMiniStr;}
//# sourceMappingURL=get-resources.js.map
