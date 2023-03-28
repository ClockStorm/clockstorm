const webpack = require('webpack')
const { inDev } = require('./webpack.helpers')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  inDev() && new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin({
    template: 'src/popup/popup.html',
    favicon: false,
    chunks: ['popup'],
    filename: 'popup.html',
    inject: true,
  }),
  new HtmlWebpackPlugin({
    template: 'src/extension-options/extension-options.html',
    favicon: false,
    chunks: ['extension-options'],
    filename: 'extension-options.html',
    inject: true,
  }),
  new HtmlWebpackPlugin({
    template: 'src/offscreen/offscreen.html',
    favicon: false,
    chunks: ['offscreen'],
    filename: 'offscreen.html',
    inject: true,
  }),
  new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[name].chunk.css',
  }),
].filter(Boolean)
