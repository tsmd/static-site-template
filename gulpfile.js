const spawn = require("child_process").spawn;
const fs = require("fs");
const del = require("del");
const dotenv = require("dotenv");
const gulp = require("gulp");
const gutil = require("gulp-util");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postCss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csswring = require("csswring");
const gimagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const browserSync = require("browser-sync").create();

dotenv.config();

/** Production モード */
const isProduction = process.env.NODE_ENV === "production";

/** src ディレクトリ */
const srcDir = "src";

/** 静的ファイル格納ディレクトリ */
const publicDir = "public";

/** build 時の出力ディレクトリ */
const distDir = "dist";

/** 開発用サーバーのドキュメントルートとなる一時フォルダ */
const tempDir = ".tmp";

const targetDir = isProduction ? distDir : tempDir;

// -----------------------------------------------------
// CSS
// -----------------------------------------------------

const css = () => {
  return gulp
    .src([
      `${srcDir}/assets/stylesheets/*.scss`,
      `!${srcDir}/assets/stylesheets/_*.scss`
    ])
    .pipe(!isProduction ? sourcemaps.init() : gutil.noop())
    .pipe(
      sass({
        includePaths: ["node_modules"],
        outputStyle: "nested"
      }).on("error", sass.logError)
    )
    .pipe(rename({ extname: ".bundle.css" }))
    .pipe(
      postCss([
        autoprefixer({ grid: true }) // Browserslist is in package.json
      ])
    )
    .pipe(isProduction ? postCss([csswring()]) : gutil.noop())
    .pipe(!isProduction ? sourcemaps.write(".") : gutil.noop())
    .pipe(gulp.dest(`${targetDir}/assets/stylesheets`));
};

// -----------------------------------------------------
// JavaScript
// -----------------------------------------------------

const js = done => {
  const args = isProduction ? [""] : ["--watch"];
  const child = spawn("webpack", args, {
    shell: true,
    stdio: "inherit"
  });
  if (isProduction) {
    child.on("exit", done);
  } else {
    done();
  }
};

// -----------------------------------------------------
// Image
// -----------------------------------------------------

const imagemin = () => {
  const pattern = "**/*.{png,jpg,jpeg,gif,svg}";
  return gulp
    .src([`${publicDir}/${pattern}`, `${srcDir}/${pattern}`], { base: "." })
    .pipe(gimagemin())
    .pipe(gulp.dest("."));
};

const svgSprite = () => {
  const baseDir = `${srcDir}/assets/images/sprites`;
  const distDir = `${targetDir}/assets/images/sprites`;
  return Promise.all(
    fs
      .readdirSync(baseDir)
      .filter(file => fs.statSync(`${baseDir}/${file}`).isDirectory())
      .map(dir =>
        gulp
          .src(`${baseDir}/${dir}/*.svg`)
          .pipe(svgstore())
          .pipe(
            isProduction
              ? gimagemin([
                  gimagemin.svgo({
                    plugins: [
                      { removeUselessDefs: false },
                      { cleanupIDs: false }
                    ]
                  })
                ])
              : gutil.noop()
          )
          .pipe(gulp.dest(distDir))
      )
  );
};

// -----------------------------------------------------
// Static File
// -----------------------------------------------------

gulp.task("static", () => {
  return gulp
    .src([`${publicDir}/**/*`], { dot: true })
    .pipe(gulp.dest(targetDir));
});

// -----------------------------------------------------
// Clean
// -----------------------------------------------------

const clean = () => {
  return del(`${targetDir}/**/*`, { dot: true });
};

// -----------------------------------------------------
// Server
// -----------------------------------------------------

const serve = done => {
  browserSync.init(
    {
      // proxy: process.env.APACHE_VHOST || 'localhost:3002',
      files: [`${tempDir}/**/*`, `${publicDir}/**/*`],
      server: {
        baseDir: [tempDir, publicDir]
      },
      notify: false,
      open: false,
      reloadDebounce: 100
    },
    done
  );
};

// ------------------------------------------------------
// Watch
// ------------------------------------------------------

const watch = () => {
  gulp.watch(`${srcDir}/assets/stylesheets/**/*.scss`, gulp.series(css));
};

// ------------------------------------------------------
// Export tasks
// ------------------------------------------------------

gulp.task(
  "default",
  gulp.series(clean, gulp.parallel(css, js, svgSprite), serve, watch)
);

gulp.task(
  "build",
  gulp.series(clean, gulp.parallel("static", css, js, svgSprite))
);

gulp.task("imagemin", gulp.series(imagemin));
