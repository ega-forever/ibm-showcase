const gulp = require('gulp'),
  inline = require('gulp-inline'),
  concat = require('gulp-concat');

gulp.task('default', function () {
  gulp.src('./dist/index.html')
    .pipe(inline({
      base: 'dist/',
    }))
    .pipe(gulp.dest('./out'))
});
