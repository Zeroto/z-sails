var gulp = require('gulp');

var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var karma = require('gulp-karma');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
  scripts: ['src/**/*.js'],
};

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['dist'], cb);
});

gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(concat('z-sails.js'))
	.pipe(gulp.dest('dist'))
	.pipe(rename('z-sails.min.js'))
	.pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function(){
	return gulp.src('foobar') // invalid name so karma still loads from config
	.pipe(karma({
		configFile: 'karma.conf.js',
		action: 'run'
	}));
});

gulp.task('build', ['scripts']);