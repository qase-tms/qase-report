const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/main.tsx',

  module: {

    rules: [

      {

        test: /\.tsx?$/,

        use: 'ts-loader',

        exclude: /node_modules/,

      },
      {
        test: /\.css$/,

        use: ['style-loader', 'css-loader']
      },
      
        {
          test: /\.(png|svg|jpg|jpeg|gif|env)$/i,
          type: "asset/resource",
        },

    ],

  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
    }),
  ],

};