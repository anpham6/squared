const gulp = require('gulp');
 
gulp.task('minify', () => {
  return gulp.src('*')
    .pipe(gulp.dest('./'));
});