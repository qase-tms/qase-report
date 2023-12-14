const path = require('path');
const commonConfig = require('./webpack.config.common.cjs');
const Dotenv = require('dotenv-webpack');

module.exports = {

  ...commonConfig,
  mode: 'production',

  plugins: [
    ...commonConfig.plugins,
    new Dotenv({
      NODE_ENV: 'production'
    })
  ],

  output: {

    filename: '[name].[fullhash].bundle.js',

    path: path.resolve(__dirname, '..', 'dist')

  },

};