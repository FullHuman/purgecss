# Gulp

Start by installing the gulp plugin as a dev dependency.

```
npm i -D gulp-purgecss
```

```js
const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
  return gulp
    .src('src/**/*.css')
    .pipe(
      purgecss({
        content: ['src/**/*.html']
      })
    )
    .pipe(gulp.dest('build/'))
})
```



