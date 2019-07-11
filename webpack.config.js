const resolve = require("path").resolve;

/** Production モード */
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    main: resolve(__dirname, "public/assets/javascripts-dev/main.js")
  },
  output: {
    path: resolve(__dirname, `public/assets/javascripts`),
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
