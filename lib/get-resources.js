var console = require('unclog');
var Promise = require('bluebird');
var fs = require('fs');
var wrench = require('wrench');
var Path = require('path');

var uglifyJS = require('uglify-js');
var stylus = require('stylus');
var nib = require('nib')();
var CleanCSS = require('clean-css');

var app = require('./');
var config = app.config;
var dev = config.dev;

var resources = {
    public: {},
    client: {},
    angularApp: [],
}

module.exports = function getResources(basedirs) {
    console.verbose('Loading resources...');
    basedirs.forEach(lookInBasedir);
    if (!app.config.dev)
    // basedirs.forEach(minify);
        minify();
    return resources;
};


function minify(basedir) {
    console.verbose('Minifying resources... ');
    ['public', 'client'].forEach(function(topdir) {
        try {
            var writePath = topdir + Path.sep + topdir + '.min.js';
            var mapPath = topdir + '.min.js.map';
            console.verbose(' …' + Path.sep + writePath);
            try {
                fs.unlinkSync(writePath);
            } catch (err) {}
            var minifiedJS = uglifyJS.minify(resources[topdir].js.fullpaths, {
                outSourceMap: mapPath,
                mangle: (topdir != 'client'),
            });
            fs.writeFileSync(writePath, minifiedJS.code);
            fs.writeFileSync(writePath + '.map', minifiedJS.map);
            resources[topdir].js.min = topdir + '.min.js';
        } catch (err) {}
        try {
            var writePath = topdir + Path.sep + topdir + '.min.css';
            console.verbose(' …' + Path.sep + writePath);
            try {
                fs.unlinkSync(writePath);
            } catch (err) {}
            resources[topdir].css.fullpaths.forEach(function(fullpath) {
                resources[topdir].css.min = topdir + '.min.css';
                var css = fs.readFileSync(fullpath);
                css = css.toString('ascii');
                if (Path.extname(fullpath) == '.css')
                    minified(null, new CleanCSS().minify(css).styles);
                else if (Path.extname(fullpath) == '.styl')
                    stylus(css)
                    .set('filename', fullpath)
                    .set('compress', !dev)
                    // .set('sourcemap', true)
                    // .set('sourcemap', {
                    //     inline: true
                    // })
                    .use(nib)
                    .import('nib')
                    .render(minified);
                else
                    console.debug('Path.extname(' + fullpath + '):', Path.extname(fullpath));

                function minified(err, css) {
                    if (err) return console.err(err);
                    if (css.styles) css = css.styles;
                    fs.appendFileSync(writePath, css);
                }

            });
        } catch (err) {
            console.err(err);
        }
    });
}


function lookInBasedir(basedir) {
    var basedirs = [
        Path.join(basedir + '/public'),
        Path.join(basedir + '/client'),
    ];
    basedirs.forEach(lookInBasedirsBasedir);
}

function lookInBasedirsBasedir(basedir) {
    var propertyName = basedir.split(/[\/\\]+/).pop();
    try {
        wrench.readdirSyncRecursive(basedir).forEach(categorize.bind({
            basedir: basedir,
            propertyName: propertyName,
            resources: resources,
            files: resources[propertyName],
        }));
    } catch (err) {} finally {}
}

function categorize(file, i, l) {
    var basedir = this.basedir;
    var fullpath = basedir + Path.sep + file;
    // var fullpath = Path.join(fullpath);
    file = file.replace(/[\\\/]+/g, '/'); //\/ for URLs
    var files = this.files;
    var ext = Path.extname(file).substring(1);
    if (!ext || !ext.length || ext == '') return;

    if (ext == 'min') return;
    if (ext == 'map') return;
    if (file.match(/\.min.((js)|(css)|(map))$/)) return;

    if (ext == 'styl') {
        ext = 'css';
        file = file.replace('.styl', '.css');
    }

    var log = app.config.basedir.resolve(this.basedir);
    if (log) {
        if (i < 1) {
            console.verbose(' ', log);
            console.verbose.stdout('      ');
        }
        if (i > 0) {
            var dirname = Path.dirname(Path.join(this.basedir, file))
            var prev_dirname = Path.dirname(Path.join(this.basedir, l[i - 1]))
            if (dirname != prev_dirname) {
                console.verbose.stdout('\n      ');
            } else
                console.verbose.stdout(', ');
        }
        log = app.config.basedir.resolve(Path.join(this.basedir, file));
        if (log)
            console.verbose.stdout(Path.basename(log));
        if (i >= l.length - 1)
            console.verbose.stdout('\n');
    }
    if (!files[ext])
        files[ext] = [];
    if (!files[ext].fullpaths)
        files[ext].fullpaths = [];
    var filename = fileName(file);

    // If duplicate already exist,
    if (files[ext].indexOf(file) != -1) return;
    // previous one takes precedence.

    if (filename == 'jquery') {
        files[ext].unshift(file);
        files[ext].fullpaths.unshift(fullpath);
    } else if (filename == 'angular') {
        if (fileName(files[ext][0]) == 'jquery') {
            files[ext].splice(1, 0, file);
            files[ext].fullpaths.splice(1, 0, fullpath);
        } else {
            files[ext].unshift(file);
            files[ext].fullpaths.unshift(fullpath);
        }
    } else {
        if (fileName(files[ext][files[ext].length - 1]) == 'app') {
            files[ext].splice((files[ext].length - 2), 0, file);
            files[ext].fullpaths.splice((files[ext].fullpaths.length - 2), 0, fullpath);
        } else {
            files[ext].push(file);
            files[ext].fullpaths.push(fullpath);
        }
    }
    if ((file.indexOf('components') > -1) && (ext == 'js'))
        resources.angularApp.push(filename.replace(/-([a-z])/g, function(g) {
            return g[1].toUpperCase();
        }));
}

function fileName(file) {
    var ext = Path.extname(file).substring(1);
    var filename = Path.basename(file, ('.' + ext));
    if (filename.slice(-4) == '.min')
        filename = filename.slice(0, -4);
    filename = filename.toLowerCase();
    return filename;
}
