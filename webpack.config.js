const resolve = require("path").resolve;
const webpack = require("webpack");

/** Production モード */
const isProduction = process.env.NODE_ENV === "production";

/** build 時の出力ディレクトリ */
const distDir = "dist";

/** 開発用サーバーのドキュメントルートとなる一時フォルダ */
const tempDir = ".tmp";

const targetDir = isProduction ? distDir : tempDir;

module.exports = {
  // モード値を production に設定すると最適化された状態で、
  // development に設定するとソースマップ有効でJSファイルが出力される
  mode: isProduction ? "production" : "development",

  entry: {
    main: resolve(__dirname, "src/assets/javascripts/main.js")
  },
  output: {
    path: resolve(__dirname, `${targetDir}/assets/javascripts`),
    filename: "[name].bundle.js"
  },
  devtool: isProduction ? false : "inline-source-map",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ],
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
