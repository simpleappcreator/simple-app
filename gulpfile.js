require('unclog')('p');
const gulp = require('gulp');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed-in-place');

const order = require('gulp-order');
const concat = require('gulp-concat');
const wrap = require('gulp-wrap');
const concatFilenames = require('gulp-concat-filenames');

process.title = 'Gulp: ' + cwd;

gulp.task('babel', done =>
    gulp.src('**/*.es6')
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
        sourceRoot: '.'
    }))
    .pipe(gulp.dest('.')));

gulp.task('concatjs', done =>
    gulp.src('lib/client/**/*.js')
    // .pipe(sourcemaps.init())
    .pipe(order([
        'polyfill',
        'jquery.js',
        'lib/client/public/vendor/js/jquery.js',
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
    ]))
    // .pipe(wrap('//file.path=<%= file.path %>\n<%= contents %>'))
    // .pipe(concat('root.min.js'))
    .pipe(concatFilenames('root.manifest.js', {}))
    // .pipe(sourcemaps.write('.', {sourceRoot: '.'}))
    .pipe(gulp.dest('lib/client')));


gulp.task('build', gulp.series('babel'));

gulp.task('watch', done =>
    gulp.watch('**/*.es6', gulp.series('babel')));

gulp.task('default', gulp.series('build', 'watch'));

gulp.task('pre-publish', gulp.series('concatjs'));
