const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const glob = require('glob')
const fs  = require('fs')
const path = require('path')

//
// collect all the map definition files and dynamically create the
// HtmlWebpackPlugin defs needed to create static html output from them
//
console.log("collecting source files...")
var maps = glob.sync('maps/*.json')

var webPackConfigs = []

const re = /maps\/(.+)\.json/
for(map of maps) {
  const rematch = re.exec(map)
  if(!rematch) {
    continue
  }
  var basename = rematch[1]
  const mapdef = JSON.parse(fs.readFileSync(map, 'utf8'))
  console.log(' 🗺 ' +basename + ": "+ mapdef.title)
  
  if(basename === 'index') {
    basename='.'
  }
  
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
    publicPath: '/',
    filename: '[name].js'
  },
  devtool: "source-map",
  devServer: {
    //contentBase: path.join(__dirname, 'dist'),
    host: '0.0.0.0',
    hot: true,
    port: 8090
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
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  
  plugins: [
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin(), // cleans output.path by default
    ...webPackConfigs
  ]
};
