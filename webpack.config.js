const resolve = require("path").resolve;

/** Production モード */
const isProduction = process.env.NODE_ENV === "production";

/** build 時の出力ディレクトリ */
const distDir = "dist";

/** 開発用サーバーのドキュメントルートとなる一時フォルダ */
const tempDir = ".tmp";

const targetDir = isProduction ? distDir : tempDir;

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    main: resolve(__dirname, "src/assets/javascripts/main.js")
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
