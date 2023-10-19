const path = require('path');
const commonConfig = require('./webpack.config.common.cjs');

module.exports = {

  ...commonConfig,
  mode: 'production',

  output: {

    filename: '[name].[fullhash].bundle.js',

    path: path.resolve(__dirname, '..', 'dist')

  },

};