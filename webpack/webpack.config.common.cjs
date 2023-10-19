const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

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
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src')
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "public",
          to: ""
        }
      ],
    }),
    new CleanWebpackPlugin()
  ],

};