'use strict';

require('gulp-clean');
const gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    replace = require('gulp-replace'),
    mochaPhantomJS = require('gulp-mocha-phantomjs'),
    istanbul = require('gulp-istanbul'),
    istanbulReport = require('gulp-istanbul-report'),
    coveralls = require('gulp-coveralls');

// Build task, to generate the bundled browserify file
gulp.task('build', function () {
    return gulp.src('lib/jsonpipe.js')
        .pipe(browserify({
            standalone: "jsonpipe"
        }))
        .pipe(gulp.dest('.'));
});

// The watch task
gulp.task('watch', function () {
    gulp.watch('lib/**/*.js', ['build']);
});

gulp.task('test', gulp.series('build'), function () {
    return gulp.src('test/jsonpipe.html')
        .pipe(mochaPhantomJS());
});

// Add a task to instrument src files
gulp.task('instrument', gulp.series('build'), function () {
    return gulp.src('./jsonpipe.js')
        .pipe(istanbul({coverageVariable: "__coverage__"}))
        .pipe(gulp.dest('lib-cov/'));
});

// Add the test coverage task task
gulp.task('test-cov', gulp.series('instrument'), function () {
    const htmlFile = 'test/jsonpipe.html',
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
        .on('finish', function () {
            // generate coverage.json after finish
            gulp.src(coverageJSON)
                .pipe(istanbulReport({reporters: ['lcov']}));

            // Revert the html file
            gulp.src(htmlFile)
                .pipe(replace.apply(null, replaceStrs.reverse()))
                .pipe(gulp.dest('test'));
        });
});

gulp.task('report-coveralls', function () {
    return gulp.src('./coverage/lcov.info', {allowEmpty: true})
        .pipe(coveralls());
});

// Make the default task as test
gulp.task('default', gulp.series('test'));
