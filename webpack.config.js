const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'babel-polyfill': 'babel-polyfill',
        futWebApp: './src/futWebApp.js',
        content: './src/contentScript.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    resolve: {
        modules: [path.join(__dirname, 'src'), 'node_modules']
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.(ico|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
                use: 'file-loader?limit=100000'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    'file-loader?limit=100000',
                    {
                        loader: 'img-loader',
                        options: {
                            enabled: true,
                            optipng: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
      new CopyWebpackPlugin([
          { from: './src/manifest.json' },
          { from: 'assets', to: 'assets' },
      ]),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      }),
  ]
};
