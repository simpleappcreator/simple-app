const gulp = require('gulp');
const del = require('del');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const changed = require('gulp-changed-in-place');
const util = require('gulp-util');

gulp.task('clean', done =>
    del('lib/**/*.*', done));

gulp.task('copy', done =>
    gulp.src('src/**/*.*')
    .pipe(gulp.dest('lib')));

var babelSrc = ['src/**/*.js', '!src/client/public/vendor/**/*.js'];
gulp.task('babel', done =>
    gulp.src(babelSrc)
    .pipe(changed({firstPass: true}))
    .pipe(babel({presets: ['es2015', 'stage-0']}))
    .pipe(replace(/(\/\/ )?["']use strict['"];?([\n\r]+)?/g, ''))
    .pipe(gulp.dest('lib')));

gulp.task('build', gulp.series('clean', 'copy', 'babel'));

gulp.task('watch', done =>
    gulp.watch(babelSrc, gulp.series('babel')));

gulp.task('default', gulp.series('build', 'watch'));
