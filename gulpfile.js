const fs = require('fs')
const del = require('del')
const dotenv = require('dotenv')
const minimist = require('minimist')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const gulp = require('gulp')
const gutil = require('gulp-util')
const rename = require('gulp-rename')
const changed = require('gulp-changed')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const postCss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const csswring = require('csswring')
const browserify = require('browserify')
const watchify = require('watchify')
const babelify = require('babelify')
const envify = require('envify')
const uglify = require('gulp-uglify')
const gimagemin = require('gulp-imagemin')
const svgstore = require('gulp-svgstore')
const browserSync = require('browser-sync').create()

const argv = minimist(process.argv.slice(2))
dotenv.config()

/** Production モード */
const isProduction = argv.production

/** ブラウザの自動リロードを無効化する */
const noReload = argv.reload === false

/** src ディレクトリ */
const srcDir = 'src'

/** 静的ファイル格納ディレクトリ */
const publicDir = 'public'

/** build 時の出力ディレクトリ */
const distDir = 'dist'

/** 開発用サーバーのドキュメントルートとなる一時フォルダ */
const tempDir = '.tmp'

const targetDir = isProduction ? distDir : tempDir

// -----------------------------------------------------
// CSS
// -----------------------------------------------------

const css = () => {
  return gulp.src(`${srcDir}/assets/stylesheets/main.scss`)
    .pipe(!isProduction ? sourcemaps.init() : gutil.noop())
    .pipe(sass({
      includePaths: ['node_modules'],
      outputStyle: 'nested',
    }).on('error', sass.logError))
    .pipe(rename({extname: '.bundle.css'}))
    .pipe(postCss([
      autoprefixer({grid: true}), // Browserslist is in package.json
    ]))
    .pipe(isProduction ? postCss([
      csswring(),
    ]) : gutil.noop())
    .pipe(!isProduction ? sourcemaps.write('.') : gutil.noop())
    .pipe(gulp.dest(`${targetDir}/assets/stylesheets`))
    .pipe(noReload ? gutil.noop() : browserSync.stream({match: '**/*.css'}))
}

// -----------------------------------------------------
// JavaScript
// -----------------------------------------------------

const js = () => {
  const bundler = browserify(`${srcDir}/assets/javascripts/main.js`, {
    cache: {},
    packageCache: {},
  })
    .transform(babelify)
    .transform(envify)

  const bundle = () => bundler
    .bundle()
    .on('error', err => gutil.log('Browserify Error', err))
    .pipe(source(`main.bundle.js`))
    .pipe(buffer())
    .pipe(!isProduction ? sourcemaps.init() : gutil.noop())
    .pipe(isProduction ? uglify() : gutil.noop())
    .pipe(!isProduction ? sourcemaps.write('.') : gutil.noop())
    .pipe(gulp.dest(`${targetDir}/assets/javascripts`))

  if (!isProduction) {
    bundler.plugin(watchify)
    bundler.on('update', bundle)
    bundler.on('log', gutil.log)
  }

  return bundle()
}

// -----------------------------------------------------
// Image
// -----------------------------------------------------

const imagemin = () => {
  return gulp.src(`${srcDir}/**/*.{png,jpg,jpeg,gif,svg}`)
    .pipe(changed(tempDir, {hasChanged: changed.compareContents}))
    .pipe(gimagemin([
      gimagemin.svgo({
        plugins: [
          {removeUselessDefs: false},
          {cleanupIDs: false},
        ]
      }),
    ]))
    .pipe(gulp.dest(tempDir))
    .pipe(gulp.dest(srcDir))
}

const svgSprite = () => {
  const baseDir = `${srcDir}/assets/sprites`
  return Promise.all(
    fs.readdirSync(baseDir)
      .filter(file => fs.statSync(`${baseDir}/${file}`).isDirectory())
      .map(dir => gulp.src(`${baseDir}/${dir}/*.svg`)
        .pipe(rename({prefix: `${dir}-`}))
        .pipe(svgstore())
        .pipe(gulp.dest(baseDir)))
  )
}

// -----------------------------------------------------
// Static File
// -----------------------------------------------------

gulp.task('static', () => {
  return gulp.src([
    `${srcDir}/**`,
    `${srcDir}/**/.htaccess`,
    `!${srcDir}/assets/javascripts/**`,
    `!${srcDir}/assets/sprites/*/**/*`,
    `!${srcDir}/assets/stylesheets/**`,
  ], {since: gulp.lastRun('static')})
    .pipe(gulp.dest(targetDir))
})

// -----------------------------------------------------
// Clean
// -----------------------------------------------------

const clean = () => {
  return del(`${targetDir}/**/*`, {dot: true})
}

// -----------------------------------------------------
// Server
// -----------------------------------------------------

const serve = (done) => {
  browserSync.init({
    proxy: process.env.APACHE_VHOST || 'localhost:3002',
    notify: false,
    open: false,
    reloadDebounce: 100,
  }, done)
}

// ------------------------------------------------------
// Watch
// ------------------------------------------------------

const watch = () => {
  gulp.watch([
    `${srcDir}/**`,
    `${srcDir}/**/.*`,
  ], gulp.series('static'))
  gulp.watch(`${srcDir}/assets/stylesheets/**/*.scss`, gulp.series(css))

  if (!noReload) {
    gulp.watch([
      `${targetDir}/**`,
      `${targetDir}/**/.*`,
      // CSSは BrowserSync.stream を使って反映するため watch 対象外
      `!${targetDir}/assets/stylesheets/**/*`,
    ], browserSync.reload)
  }
}

// ------------------------------------------------------
// Export tasks
// ------------------------------------------------------

gulp.task('default', gulp.series(
  clean,
  gulp.parallel(
    'static',
    css,
    js
  ),
  serve,
  watch
))

gulp.task('build', gulp.series(
  imagemin,
  svgSprite,
  gulp.parallel(
    imagemin,
    clean
  ),
  gulp.parallel(
    'static',
    css,
    js
  )
))
