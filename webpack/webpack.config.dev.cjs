const path = require('path');
const commonConfig = require('./webpack.config.common.cjs');
const Dotenv = require('dotenv-webpack');

module.exports = {
  ...commonConfig,

  plugins: [
    ...commonConfig.plugins,
    new Dotenv({
      NODE_ENV: 'development'
    })
  ],

  mode: 'development',

  output: {

    filename: 'bundle.js',

    path: path.resolve(__dirname, '..', 'dist'),

  },


  devtool: 'source-map',

  devServer: {

    static: path.join(__dirname, 'dist'),
    port: 3000

  },

};