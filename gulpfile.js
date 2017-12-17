const fs = require('fs')
const del = require('del')
const dotenv = require('dotenv')
const minimist = require('minimist')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const gulp = require('gulp')
const gutil = require('gulp-util')
const rename = require('gulp-rename')
const runSequence = require('run-sequence')
const changed = require('gulp-changed')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const tildeImporter = require('node-sass-tilde-importer')
const postCss =require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const mergeLonghand = require('postcss-merge-longhand')
const csswring = require('csswring')
const browserify = require('browserify')
const watchify = require('watchify')
const licensify = require('licensify')
const babelify = require('babelify')
const envify = require('envify')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
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

/** build 時の出力ディレクトリ */
const distDir = 'dist'

/** 開発用サーバーのドキュメントルートとなる一時フォルダ */
const tempDir = '.tmp'

const targetDir = isProduction ? distDir : tempDir

// -----------------------------------------------------
// CSS
// -----------------------------------------------------

gulp.task('css', () => {
  const postCssPlugins = []

  return gulp.src(`${srcDir}/assets/stylesheets/main.scss`)
    .pipe(isProduction ? sourcemaps.init() : gutil.noop())
    .pipe(sass({
      importer: tildeImporter,
      outputStyle: 'nested',
    }).on('error', sass.logError))
    .pipe(rename({extname: '.bundle.css'}))
    .pipe(postCss([
      autoprefixer({grid: true}), // Browserslist is in package.json
    ]))
    .pipe(isProduction ? postCss([
      mergeLonghand(),
      csswring(),
    ]) : gutil.noop())
    .pipe(isProduction ? sourcemaps.write('.') : gutil.noop())
    .pipe(gulp.dest(`${targetDir}/assets/stylesheets`))
    .pipe(noReload ? gutil.noop() : browserSync.stream({match: '**/*.css'}))
})

// -----------------------------------------------------
// JavaScript
// -----------------------------------------------------

gulp.task('js', () => {
  const bundler = browserify(`${srcDir}/assets/javascripts/main.js`, {
    cache: {},
    packageCache: {},
  })
    .plugin(licensify)
    .transform(babelify, {presets: ["es2015"]})
    .transform(envify)

  const bundle = () => bundler
    .bundle()
    .on('error', err => gutil.log('Browserify Error', err))
    .pipe(source(`main.bundle.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(isProduction ? uglify() : gutil.noop())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${targetDir}/assets/javascripts`))

  if (!isProduction) {
    bundler.plugin(watchify)
    bundler.on('update', bundle)
    bundler.on('log', gutil.log)
  }

  return bundle()
})

// -----------------------------------------------------
// Image
// -----------------------------------------------------

gulp.task('imagemin', () => {
  return gulp.src(`${srcDir}/**/*.{png,jpg,jpeg,gif,svg}`)
    .pipe(changed(tempDir, {hasChanged: changed.compareContents}))
    .pipe(imagemin([
      imagemin.svgo({plugins: [
        {removeUselessDefs: false},
        {cleanupIDs: false},
      ]}),
    ]))
    .pipe(gulp.dest(tempDir))
    .pipe(gulp.dest(srcDir))
})

gulp.task('svgSprite', () => {
  const baseDir = `${srcDir}/assets/sprites`
  return Promise.all(
    fs.readdirSync(baseDir)
      .filter(file => fs.statSync(`${baseDir}/${file}`).isDirectory())
      .map(dir => gulp.src(`${baseDir}/${dir}/*.svg`)
        .pipe(rename({prefix: `${dir}-`}))
        .pipe(svgstore())
        .pipe(gulp.dest(baseDir)))
  )
})

// -----------------------------------------------------
// Static File
// -----------------------------------------------------

gulp.task('static', () => {
  return gulp.src([
    `${srcDir}/**`,
    `${srcDir}/**/.htaccess`,
    `!${srcDir}/assets/javascripts/**`,
    `!${srcDir}/assets/sprites/*/**`,
    `!${srcDir}/assets/stylesheets/**`,
  ])
    .pipe(changed(targetDir))
    .pipe(gulp.dest(targetDir))
})

// -----------------------------------------------------
// Clean
// -----------------------------------------------------

gulp.task('clean', () => {
  return del(`${targetDir}/**/*`, {dot: true})
})

// -----------------------------------------------------
// Server
// -----------------------------------------------------

gulp.task('serve', () => {
  browserSync.init({
    proxy: process.env.APACHE_VHOST || 'localhost:3002',
    notify: false,
    open: false,
    reloadDebounce: 100,
  })
})

// ------------------------------------------------------
// Watch
// ------------------------------------------------------

gulp.task('watch', () => {
  gulp.watch([
    `${srcDir}/**`,
    `${srcDir}/**/.*`,
  ], ['static'])
  gulp.watch(`${srcDir}/assets/stylesheets/**/*.scss`, ['css'])

  if (!noReload) {
    gulp.watch([
      `${targetDir}/**`,
      `${targetDir}/**/.*`,
      // CSSは BrowserSync.stream を使って反映するため watch 対象外
      `!${targetDir}/assets/stylesheets/**/*`,
    ], browserSync.reload)
  }
})

// ------------------------------------------------------
// Export tasks
// ------------------------------------------------------

gulp.task('default', done => {
  runSequence(
    ['clean'],
    ['static', 'css', 'js'],
    ['serve'],
    ['watch'],
    done
  )
})

gulp.task('build', done => {
  runSequence(
    ['imagemin'],
    ['svgSprite'],
    ['imagemin', 'clean'], // SVG Sprite生成後にもimageminを適用する
    ['static', 'css', 'js'],
    done
  )
})
