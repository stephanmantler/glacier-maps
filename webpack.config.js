const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const glob = require('glob')
const fs  = require('fs')

console.log("collecting source files...")
var maps = glob.sync('maps-*.json')
console.log('map configurations found: ' + maps.join(' '))

var webPackConfigs = []

const re = /maps-(.+)\.json/
for(map of maps) {
  const rematch = re.exec(map)
  if(!rematch) {
    continue
  }
  const basename = rematch[1]
  const mapdef = JSON.parse(fs.readFileSync(map, 'utf8'));
  console.log(' • ' +basename + ": "+ mapdef.title)
  
  webPackConfigs.push(
    new HtmlWebpackPlugin({
      template: './templates/map.ejs',
      templateParameters: {
        'mapDef': map,
        'title': mapdef.title
      },
      inject: false,
      filename: basename+"/index.html"
    })
  )
}

module.exports = {
  entry: {
    main: './js/builder.js',
  },
  output: {
    path: __dirname +'/dist/',
    library: 'stepman',
    publicPath: '/dist/',
    filename: '[name].js'
  },
  devtool: "source-map",
  devServer: {
    host: '0.0.0.0',
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: {
          loader: "ejs-compiled-loader",
            options: {
              htmlmin: true,
              htmlminOptions: {
                removeComments: true
              }
            }
        }
      },
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
      }
    ]
  },
  
  plugins: [
    new CleanWebpackPlugin(), // cleans output.path by default
    ...webPackConfigs
  ]
};
