require('unclog')('p');
process.title = 'Gulp: ' + cwd;
const gulp = require('gulp');
const gutil = require("gulp-util");
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed-in-place');

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');


gulp.task('babel', done =>
    gulp.src('**/*.es6')
    .pipe(changed({firstPass:true}))
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015', 'stage-0'],
        retainLines: 'true',
    }))
    .pipe(replace(/(\/\/ )?["']use strict['"];?([\n\r]+)?/g, ''))
    .pipe(sourcemaps.write('.', {sourceRoot: '.'}))
    .pipe(gulp.dest('.')));


gulp.task('webpack', done =>
    webpack(webpackConfig, function(err, stats) {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            // output options
            colors: false,
        }));
        done();
    }));

gulp.task('build', gulp.series('babel'));

gulp.task('watch', done =>
    gulp.watch('**/*.es6', gulp.series('babel')));

gulp.task('default', gulp.series('build', 'watch'));
