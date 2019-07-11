const resolve = require("path").resolve;

/** Production モード */
const isProduction = process.env.NODE_ENV === "production";

/** 基底ディレクトリ */
const baseDir = "public";

/** build 時の出力ディレクトリ */
const distDir = "dist";

const targetDir = isProduction ? distDir : baseDir;

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    main: resolve(__dirname, `${baseDir}/assets/javascripts-src/main.js`)
  },
  output: {
    path: resolve(__dirname, `${targetDir}/assets/javascripts`),
    filename: "[name].bundle.js"
  },
  devtool: isProduction ? "source-map" : "eval-source-map",
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  }
};
