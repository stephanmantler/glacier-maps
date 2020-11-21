const webpack = require('webpack');

module.exports = {
  entry: {
    main: './main.js',
    treasure: './treasure/main.js'
  },
  output: {
    path: __dirname +'/dist',
    filename: '[name].js'
  },
  devServer: {
    host: '0.0.0.0',
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
      }
    ]
  }
};
