const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('default', () => {
  return gulp
    .src('src/**/*.css')
    .pipe(
      purgecss({
        content: ['src/*.html']
      })
    )
    .pipe(gulp.dest('build'))
})
