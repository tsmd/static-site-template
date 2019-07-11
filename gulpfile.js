const spawn = require("child_process").spawn;
const fs = require("fs");
const del = require("del");
const dotenv = require("dotenv");
const gulp = require("gulp");
const gimagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const browserSync = require("browser-sync").create();

dotenv.config();

/** Production モード */
const isProduction = process.env.NODE_ENV === "production";

/** 基底ディレクトリ */
const baseDir = "public";

/** build 時の出力ディレクトリ */
const distDir = "dist";

const targetDir = isProduction ? distDir : baseDir;

// -----------------------------------------------------
// CSS
// -----------------------------------------------------

const css = done => {
  const args = [
    `${baseDir}/assets/stylesheets-src/*.scss`,
    `!${baseDir}/assets/stylesheets-src/_*.scss`,
    `--dir ${targetDir}/assets/stylesheets`,
    "--ext bundle.css",
    "--verbose"
  ];
  if (!isProduction) {
    args.push("--watch");
  }
  const child = spawn("postcss", args, {
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
    .src([`${baseDir}/${pattern}`], { base: "." })
    .pipe(gimagemin())
    .pipe(gulp.dest("."));
};

const svgSprite = () => {
  const srcDir = `${baseDir}/assets/images/sprites`;
  const distDir = `${targetDir}/assets/images/sprites`;
  return Promise.all(
    fs
      .readdirSync(srcDir)
      .filter(file => fs.statSync(`${srcDir}/${file}`).isDirectory())
      .map(dir =>
        gulp
          .src(`${srcDir}/${dir}/*.svg`)
          .pipe(svgstore())
          .pipe(gulp.dest(distDir))
      )
  );
};

// -----------------------------------------------------
// Clean
// -----------------------------------------------------

const cleanDev = () => {
  return Promise.all([
    del(`${baseDir}/assets/javascripts/**/*`, { dot: true }),
    del(`${baseDir}/assets/stylesheets/**/*`, { dot: true })
  ]);
};

const cleanProd = () => {
  return del(`${distDir}/**/*`, { dot: true });
};

// -----------------------------------------------------
// Deploy
// -----------------------------------------------------

const deploy = () => {
  return gulp
    .src(
      [
        `${baseDir}/**/*`,
        `!${baseDir}/assets/images/sprites/**`,
        `!${baseDir}/assets/javascripts-src/**`,
        `!${baseDir}/assets/stylesheets-src/**`
      ],
      { dot: true }
    )
    .pipe(gulp.dest(distDir));
};

// -----------------------------------------------------
// Server
// -----------------------------------------------------

const serve = done => {
  browserSync.init(
    {
      // proxy: process.env.APACHE_VHOST || 'localhost:3002',
      files: [
        `${baseDir}/**/*`,
        `!${baseDir}/assets/javascripts-src`,
        `!${baseDir}/assets/stylesheets-src`
      ],
      server: baseDir,
      notify: false,
      open: false,
      reloadDebounce: 100
    },
    done
  );
};

// ------------------------------------------------------
// Export tasks
// ------------------------------------------------------

gulp.task(
  "default",
  gulp.series(cleanDev, gulp.parallel(css, js, svgSprite), serve)
);

gulp.task(
  "build",
  gulp.series(cleanProd, deploy, gulp.parallel(css, js, svgSprite))
);

gulp.task("imagemin", gulp.series(imagemin));
