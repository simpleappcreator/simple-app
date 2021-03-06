require('unclog')('p');
process.title = process.title.match(/gulp/i) ? process.title : cwd.split(/[\/\\]+/g).slice(-3).reverse().join(' ') + ' - Webpack';
const webpack = require('webpack');
const entryPath = Path.join(__dirname, 'lib/client');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    cache: true,
    // watch: true,
    devtool: 'source-map',
    entry: Path.join(entryPath, 'webpack-entry.js'),
    output: {
        path: entryPath,
        publicPath: 'client/',
        filename: 'webpack.min.js',
        // chunkFilename: '[chunkhash].js'
        sourceMapFilename: 'webpack.min.js.map'
    },
    module: {
        loaders: [
            // // required to write 'require('./style.css')'
            // { test: /\.css$/,    loader: 'style-loader!css-loader' },

            // // required for bootstrap icons
            // { test: /\.woff$/,   loader: 'url-loader?prefix=font/&limit=5000&mimetype=application/font-woff' },
            // { test: /\.ttf$/,    loader: 'file-loader?prefix=font/' },
            // { test: /\.eot$/,    loader: 'file-loader?prefix=font/' },
            // { test: /\.svg$/,    loader: 'file-loader?prefix=font/' },

            // // required for react jsx
            // { test: /\.js$/,    loader: 'jsx-loader' },
            // { test: /\.jsx$/,   loader: 'jsx-loader?insertPragma=React.DOM' },
        ]
    },
    resolve: {
        root: process.env.NODE_PATH.split(/[\;\:]/g),
        alias: {
            // angular: Path.join(entryPath, 'public/vendor/js/angular.js'),
            // jquery: Path.join(entryPath, 'public/vendor/js/jquery.js'),
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            $: 'jquery',
            // angular: 'angular',
            // 'window.angular': 'angular',
            io: 'socket.io-client',
            ngDirective: 'simple-app/lib/client/public/main/js/create-ng-directive.js',
            app: 'simple-app/lib/client/public/main/js/root.js',
        }),
        new ngAnnotatePlugin({
            add: true,
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false,
            },
            mangle: {
                except: ['$super', '$', 'exports', 'require', ],
            },
            output: {
                comments: false,
            },
        }),
    ]
};
