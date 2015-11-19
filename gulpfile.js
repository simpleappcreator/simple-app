require('unclog')('p');
const gulp = require('gulp');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed-in-place');

process.title = 'Gulp: ' + cwd;

gulp.task('babel', done =>
    gulp.src('**/*.es6')
    .pipe(changed({firstPass: true}))
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015', 'stage-0'],
        retainLines: 'true',
    }))
    .pipe(replace(/(\/\/ )?["']use strict['"];?([\n\r]+)?/g, ''))
    .pipe(sourcemaps.write('.', { sourceRoot: '.' }))
    .pipe(gulp.dest('.')));


gulp.task('build', gulp.series('babel'));

gulp.task('watch', done =>
    gulp.watch('**/*.es6', gulp.series('babel')));

gulp.task('default', gulp.series('build', 'watch'));
