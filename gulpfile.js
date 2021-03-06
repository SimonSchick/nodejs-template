'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var Q = require('q');


function promisifyStream(stream) {
	return new Q.Promise(function(resolve, reject) {
		stream
		.on('finish', resolve)
		.on('error', reject);
	});
}

function coveralls() {
	return promisifyStream(
		gulp.src(['coverage/lcov.info'])
		.pipe($.coveralls())
	);
}

function testAndCoverage(lcovOnly) {
	var reportOptions;

	if (lcovOnly) {
		reportOptions = {
			reporters: ['lcov', 'text', 'text-summary']
		};
	}

	return promisifyStream(
		gulp.src(['test/*.js'])
		.pipe($.mocha())
		.pipe($.istanbul.writeReports())
		.pipe($.istanbul.enforceThresholds({
			thresholds: {
				global: 90
			}
		}))
	);
}

function validateFiles(files, simple, lcovOnly) {

	var stream = gulp.src(files)
	.pipe($.jshint())
	.pipe($.jshint.reporter(require('jshint-stylish')))
	.pipe($.jshint.reporter('fail'))
	.pipe($.jscs());
	if (!simple) {
		stream = stream.pipe($.filter(['*', '!test/*']))
		.pipe($.istanbul())
		.pipe($.istanbul.hookRequire());
	}

	var retPromise = promisifyStream(stream);
	if (!simple) {
		return retPromise.then(function() {
			return testAndCoverage(lcovOnly);
		});
	}
	return retPromise;
}

var files = [
	'**/*.js',
	'!node_modules/**/*',
	'!docs/**/*',
	'!coverage/**/'
];

gulp.task('default', function() {
	if (process.env.TRAVIS) {
		return validateFiles(files, false, true);
	}
	return validateFiles(files);
});

gulp.task('simple', function() {
	return validateFiles(files, true);
});

gulp.task('coveralls', coveralls);

gulp.task('git-pre-commit', ['default']);
