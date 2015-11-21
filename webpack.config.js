require('unclog')('p');
process.title = 'Webpack: ' + cwd;
var webpack = require('webpack');
var entryPath = Path.join(__dirname, 'lib/client');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    cache: true,
    devtool: 'source-map',
    entry: Path.join(entryPath, 'webpack.js'),
    output: {
        path: entryPath,
        publicPath: 'client/',
        filename: 'root.webpack.min.js',
        // chunkFilename: '[chunkhash].js'
        sourceMapFilename: 'root.webpack.min.js.map'
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
        alias: {
            angular: Path.join(entryPath, 'public/vendor/js/angular.js'),
            jquery: Path.join(entryPath, 'public/vendor/js/jquery.js'),
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            angular: 'angular',
        }),
        // new webpack.optimize.UglifyJsPlugin({
        //     minimize: true,
        //     compress: {
        //         warnings: false,
        //     },
        //     mangle: {
        //         except: ['$super', '$', 'exports', 'require', ],
        //     },
        //     output: {
        //         comments: false,
        //     },
        // }),
        // new ngAnnotatePlugin({
        //     add: true,
        //     // other ng-annotate options here
        // }),
    ]
};
