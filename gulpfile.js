const spawn = require("child_process").spawn;
const fs = require("fs");
const del = require("del");
const dotenv = require("dotenv");
const gulp = require("gulp");
const gutil = require("gulp-util");
const gimagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const browserSync = require("browser-sync").create();

dotenv.config();

/** Production モード */
const isProduction = process.env.NODE_ENV === "production";

/** 基底ディレクトリ */
const baseDir = "public";

// -----------------------------------------------------
// CSS
// -----------------------------------------------------

const css = done => {
  const args = [
    `${baseDir}/assets/stylesheets-dev/*.scss`,
    `!${baseDir}/assets/stylesheets-dev/_*.scss`,
    `--dir ${baseDir}/assets/stylesheets`,
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
  const dir = `${baseDir}/assets/images/sprites`;
  return Promise.all(
    fs
      .readdirSync(dir)
      .filter(file => fs.statSync(`${dir}/${file}`).isDirectory())
      .map(dir =>
        gulp
          .src(`${dir}/${dir}/*.svg`)
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
          .pipe(gulp.dest(dir))
      )
  );
};

// -----------------------------------------------------
// Clean
// -----------------------------------------------------

const clean = () => {
  return Promise.all([
    del(`${baseDir}/assets/javascripts/**/*`, { dot: true }),
    del(`${baseDir}/assets/stylesheets/**/*`, { dot: true })
  ]);
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
        `!${baseDir}/assets/javascripts-dev`,
        `!${baseDir}/assets/stylesheets-dev`
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
  gulp.series(clean, gulp.parallel(css, js, svgSprite), serve)
);

gulp.task("build", gulp.series(clean, gulp.parallel(css, js, svgSprite)));

gulp.task("imagemin", gulp.series(imagemin));
