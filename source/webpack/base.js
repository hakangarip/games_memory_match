const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  devServer: {
    contentBase: [
      path.resolve(__dirname, '../'),
      path.resolve(__dirname, '../assets'),
      path.resolve(__dirname, '../assets/assets/new_png_animals/256px')
    ],
    publicPath: '/'
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, "../")
    }),
    // Copy static assets needed at runtime (Phaser loads via relative URLs)
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, "../assets"), to: "assets" },
      { from: path.resolve(__dirname, "../sounds"), to: "sounds" },
      { from: path.resolve(__dirname, "../fonts"), to: "fonts" },
      { from: path.resolve(__dirname, "../logo.gif"), to: "logo.gif" },
      { from: path.resolve(__dirname, "../favicon.ico"), to: "favicon.ico" }
    ]),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ]
};
