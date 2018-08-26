var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path')
var String
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
                            plugins: [
                                'transform-class-properties'
                            ]
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
            },
            {
                test: /ApplicationConstant\.js$/,
                loader: 'string-replace-loader',
                options: {
                    multiple: [
                       { search: '@SERVER_API_URL', replace: 'http://localhost:8080', strict: true },
                       { search: '@SERVER_TIMEOUT_VALUE', replace: '50000', strict: true },
                       { search: '@CHANNEL_CODE', replace: 'I', strict: true },
                       { search: '@BASE_CURRENCY', replace: 'HKD', strict: true }
                    ]
                }
            },
        ]
    },
    node: {
        fs: "empty"
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
        contentBase: './dist',
        historyApiFallback: true
    }
};