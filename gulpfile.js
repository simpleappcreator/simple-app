const gulp = require('gulp');
const del = require('del');
const babel = require('gulp-babel');
const replace = require('gulp-replace');

gulp.task('clean', done =>
    del('lib', done));

gulp.task('copy', done =>
    gulp.src('src/**/*.*')
    .pipe(gulp.dest('lib')));

gulp.task('babel', done =>
    gulp.src(['src/**/*.js', '!src/client/public/vendor/**/*.js'])
    .pipe(babel({
        presets: ['es2015', 'stage-0']
    }))
    .pipe(replace(/['"]use strict['"];([\n\r]+)?/g, ''))
    .pipe(gulp.dest('lib')));

gulp.task('default', gulp.series('clean', 'copy', 'babel'));
