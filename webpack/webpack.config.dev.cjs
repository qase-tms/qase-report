const path = require('path');
const commonConfig = require('./webpack.config.common.cjs');

module.exports = {
  ...commonConfig,

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