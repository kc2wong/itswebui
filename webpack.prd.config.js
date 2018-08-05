var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path')

module.exports = {
    entry: [
        'babel-polyfill',
        './src/index.js'
    ],
    resolve: {
        // root: [
        //     path.resolve('./src'),
        // ],
        alias: {
            app: path.resolve('./src/app'),
            shared: path.resolve('./src/shared'),
            assets: path.resolve('./assets')            
        },
        extensions: ['*', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: true,
                            plugins: ['transform-class-properties']
                        },
                    }
                ],
            },
            // json loader for i18n file
            { 
                test: /\.json$/, 
                include: '/src/assets/i18n/',
                use: ['json-loader']                
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(ico|jpeg|jpg|png|svg)$/,
                loader: 'file-loader',
                query: {
                    name: 'static/media/[name].[hash:8].[ext]'
                }
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'file-loader?name=public/fonts/[name].[ext]'
            }            
        ]
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    plugins: [new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: 'body'
    })],    
    devServer: {
        contentBase: './dist'
    }
};