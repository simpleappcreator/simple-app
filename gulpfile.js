const gulp = require('gulp');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const changed = require('gulp-changed-in-place');

gulp.task('babel', done =>
    gulp.src('**/*.es6')
    .pipe(changed({firstPass: true}))
    .pipe(babel({
        presets: ['es2015', 'stage-0'],
        retainLines: 'true',
    }))
    .pipe(replace(/(\/\/ )?["']use strict['"];?([\n\r]+)?/g, ''))
    .pipe(gulp.dest('.')));


gulp.task('build', gulp.series('babel'));

gulp.task('watch', done =>
    gulp.watch('**/*.es6', gulp.series('babel')));

gulp.task('default', gulp.series('build', 'watch'));
