var gulp = require('gulp'),
  browserify = require('gulp-browserify'),
  mochaPhantomJS = require('gulp-mocha-phantomjs');

// Build task, to generate the bundled browserify file
gulp.task('build', function() {
  gulp.src('lib/jsonpipe.js')
    .pipe(browserify({
      standalone: "jsonpipe"
    }))
    .pipe(gulp.dest('.'));
});

// The watch task
gulp.task('watch', function() {
  gulp.watch('lib/**/*.js', ['build']);
});

// Add the test task
gulp.task('test', ['build'], function() {
  return gulp.src('test/jsonpipe.html')
    .pipe(mochaPhantomJS());
});

// Make the default task as test
gulp.task('default', ['test']);