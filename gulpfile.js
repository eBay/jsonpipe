'use strict';

var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    replace = require('gulp-replace'),
    mochaPhantomJS = require('gulp-mocha-phantomjs'),
    istanbul = require('gulp-istanbul'),
    istanbulReport = require('gulp-istanbul-report'),
    coveralls = require('gulp-coveralls'),
    clean = require('gulp-clean');

// Build task, to generate the bundled browserify file
gulp.task('build', function() {
    return gulp.src('lib/jsonpipe.js')
        .pipe(browserify({
            standalone: "jsonpipe"
        }))
        .pipe(gulp.dest('.'));
});

// The watch task
gulp.task('watch', function() {
    gulp.watch('lib/**/*.js', ['build']);
});

gulp.task('test', ['build'], function() {
    return gulp.src('test/jsonpipe.html')
        .pipe(mochaPhantomJS());
});

// Add a task to instrument src files
gulp.task('instrument', ['build'], function() {
    return gulp.src('./jsonpipe.js')
        .pipe(istanbul({coverageVariable: "__coverage__"}))
        .pipe(gulp.dest('lib-cov/'));
});

// Add the test coverage task task
gulp.task('test-coveralls', ['instrument'], function() {
    var htmlFile = 'test/jsonpipe.html',
        replaceStrs = ['../jsonpipe.js', '../lib-cov/jsonpipe.js'],
        coverageJSON = 'coverage/coverage.json';

    return gulp.src(htmlFile)
        .pipe(replace.apply(null, replaceStrs))
        .pipe(gulp.dest('test')) // Override the same file
        .pipe(mochaPhantomJS({
            reporter: 'spec',
            phantomjs: {
                hooks: 'mocha-phantomjs-istanbul',
                coverageFile: coverageJSON
            }
        }))
        // generate coverage.json after finish
        .on('finish', function() {
            return gulp.src(coverageJSON)
                .pipe(istanbulReport({reporters: ['lcov']}));
        })
        // Revert the html file
        .on('finish', function() {
            return gulp.src(htmlFile)
                .pipe(replace.apply(null, replaceStrs.reverse()))
                .pipe(gulp.dest('test'));
        })
        // submit to coveralls
        .on('finish', function() {
            return gulp.src('./coverage/lcov.info')
                .pipe(coveralls());
        });
});

// Make the default task as test
gulp.task('default', ['test']);
