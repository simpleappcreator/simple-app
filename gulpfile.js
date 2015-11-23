require('unclog')('p');
process.title = cwd.split(/[\/\\]+/g).slice(2).reverse().join(' ') + ' - Gulp';
const del = require('del');
const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed-in-place');

const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config');

const paths = {
    'all': 'src/**/*.*',
    'es6': 'src/**/*.es6',
    'js': 'lib/client/**/*.js',
    'min': '**/*.min.js',
}

function getP(str) {
    return str.split(',').map(p =>
        p.charAt(0) == '!' ? '!' + paths[p.replace('!', '')] : paths[p]);
}

gulp.task('clean', done =>
    del('lib/**'));

gulp.task('copy', done =>
    gulp.src(getP('all,!es6'))
    .pipe(changed({
        firstPass: true
    }))
    .pipe(gulp.dest('lib')));

gulp.task('babel', done =>
    gulp.src(getP('es6'))
    .pipe(changed({
        firstPass: true
    }))
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015', 'stage-0'],
    retainLines: 'true',
    }))
    .pipe(replace(/(\/\/ )?["']use strict['"];?([\n\r]+)?/g, ''))
    .pipe(sourcemaps.write('.', {
        sourceRoot: 'src'
    }))
    .pipe(gulp.dest('lib')));


function webpackTask(opts) {
    var config = {};
    var prodPlugins = [];
    var normPlugins = _.filter(webpackConfig.plugins || [], p => {
        // Remove production-related plugins
        if (p.constructor.name == 'UglifyJsPlugin' ||
            p.constructor.name == 'ngAnnotatePlugin'
        ) return prodPlugins.push(p) <= 0;
        else return true;
    });
    config.plugins = normPlugins;
    if (typeof opts == 'object') {
        config = opts;
    } else if (typeof opts == 'string' && (opts == 'p' || opts.match('production'))) {
        config.plugins = config.plugins.concat(prodPlugins);
        config.watch = false;
    } else if (typeof opts == 'string' && (opts == 'w' || opts.match('watch'))) {
        config.watch = true;
    }

    config = _.extend({}, webpackConfig, config);

    return gulp.src(config.entry)
        .pipe(webpack(config))
        .pipe(gulp.dest(config.output.path));
}

gulp.task('webpack', done => webpackTask());

gulp.task('build', gulp.series('babel', 'webpack'));

gulp.task('watch', done => {
    gulp.watch(getP('es6'), gulp.series('babel'));
    gulp.watch(getP('all,!es6,!js'), gulp.series('copy'));
});
gulp.task('webpack-watch', done => webpackTask('watch'));
gulp.task('webpack-prod', done => webpackTask('production'));

gulp.task('default', gulp.series('clean', 'copy', 'babel', gulp.parallel('watch', 'webpack-watch')));
gulp.task('prod', gulp.series('clean', 'copy', 'babel', 'webpack-prod'));
