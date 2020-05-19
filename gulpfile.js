const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgo = require('gulp-svgo');
const svgstore = require('gulp-svgstore');
const rename = require('gulp-rename');
const del = require('del');
const server = require('browser-sync').create();

gulp.task('css', () => {
  return gulp
    .src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('css-min', () => {
  return gulp
    .src('build/css/style.css')
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('js-min', () => {
  return gulp
    .src('source/js/*.js')
    .pipe(
      uglify()
    )
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'));
})

gulp.task('clean', () => {
  return del('build');
});

gulp.task('copy', function() {
  return gulp
    .src(
      [
        'source/fonts/**/*.{woff,woff2}',
        'source/*.ico'
      ],
      {
        base: 'source'
      }
    )
    .pipe(gulp.dest('build'));
});

gulp.task('images', () => {
  return gulp
    .src('source/img/**/*{png,jpg}')
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.mozjpeg({ progressive: true }),
      ])
    )
    .pipe(gulp.dest('build/img'));
});

gulp.task('webp', () =>  {
  return gulp
    .src('source/img/**/*.{png,jpg}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('build/img'));
});

gulp.task('html', () => {
  return gulp
    .src('source/*.html')
    .pipe(posthtml([include()]))
    .pipe(htmlmin())
    .pipe(gulp.dest('build'));
});

gulp.task('svgo', () => {
  return gulp
  .src('source/img/*.svg')
  .pipe(svgo({removeStyleElement: true}))
  .pipe(gulp.dest('build/img'))
});

gulp.task('svg-sprite', () => {
  return gulp
    .src('build/img/icon-*.svg')
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('server', () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.task('refresh', (done) => {
    server.reload();
    done();
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css', 'css-min'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
  gulp.watch("source/js/*.js", gulp.series('js-min', 'refresh'));
});

gulp.task('build', gulp.series('clean', 'copy', 'css', 'css-min', 'js-min', 'images', 'webp', 'svgo', 'svg-sprite', 'html'));
gulp.task('start', gulp.series('build', 'server'));


gulp.task('dev-build', gulp.series('css', 'css-min', 'html', 'js-min'));
gulp.task('dev-start', gulp.series('dev-build', 'server'));
