var gulp = require('gulp'),
	browserify = require('gulp-browserify');

gulp.task('build', function(){
	gulp.src('lib/jsonpipe.js')
		.pipe(browserify({
			standalone: "jsonpipe"
		}))
		.pipe(gulp.dest('.'));
});