const gulp = require('gulp');
const del = require('del');
const babel = require('gulp-babel');

gulp.task('clean', done =>
    del('lib', done));

gulp.task('babel', done =>
    gulp.src(['src/**/*.js', '!src/client/public/*'])
    .pipe(babel({
        presets: ['es2015', 'stage-0']
    }))
    .pipe(gulp.dest('lib')));

gulp.task('rest', done =>
    gulp.src(['src/**/*.*', '!src/**/*.js'])
    .pipe(gulp.dest('lib')));




// gulp.task('default', 'clean', 'babel', 'rest');
gulp.task('default', gulp.series('clean', 'babel', 'rest'));
// gulp.task('default', gulp.series('clean'));
// gulp.task('default', ['rest']);
