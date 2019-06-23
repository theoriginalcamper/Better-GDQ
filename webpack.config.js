var path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: {
    background: path.join(__dirname, "app", "scripts", "background.js"),
    discordContentscript: path.join(__dirname, "app", "scripts", "discord-contentscript.js"),
    gdqContentscript: path.join(__dirname, "app", "scripts", "gdq", "gdq-contentscript.js"),
    gdqVodContentscript: path.join(__dirname, "app", "scripts", "gdq", "gdq-vod-contentscript.js"),
    esaContentscript: path.join(__dirname, "app", "scripts", "esa", "esa-contentscript.js"),
    esaVodContentscript: path.join(__dirname, "app", "scripts", "esa", "esa-vod-contentscript.js")
  },
  output: {
        /**
         * With zero configuration,
         *   clean-webpack-plugin will remove files inside the directory below
         */
        path: path.resolve(process.cwd(), 'dist'),
  },
  module: {
      rules: [
          {
              test: /\.js$/,
              use: "babel-loader"
          }
      ]
  },
  plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([
          { from: 'app/_locales/', to: '_locales'},
          { from: 'app/static', to: '' },
          { from: 'app/vendor', to: 'vendor' },
          { from: 'app/manifest.json' }
      ]),
      new FileManagerPlugin({
          onEnd: {
              mkdir: [
                 'dist/scripts/',
                 'dist/scripts/gdq/',
                 'dist/scripts/esa/',
              ],
              move: [
                  { source: 'dist/background.js', destination: 'dist/scripts/background.js' },
                  { source: 'dist/discordContentscript.js', destination: 'dist/scripts/discord-contentscript.js' },
                  { source: 'dist/gdqContentscript.js', destination: 'dist/scripts/gdq/gdq-contentscript.js' },
                  { source: 'dist/gdqVodContentscript.js', destination: 'dist/scripts/gdq/gdq-vod-contentscript.js' },
                  { source: 'dist/esaContentscript.js', destination: 'dist/scripts/esa/esa-contentscript.js' },
                  { source: 'dist/esaVodContentscript.js', destination: 'dist/scripts/esa/esa-vod-contentscript.js' },
                  { source: 'dist/static/images', destination: 'dist/images' }
              ]
          }
      })
  ],
};
