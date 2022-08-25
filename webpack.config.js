const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const glob = require('glob')

const setMPA = () => {
    const entry = {}, htmlWebpackPlugins = []
    const entryFiles = glob.sync('./src/*/index.js')
    // const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'))
    entryFiles.forEach(item => {
        const entryFile = item
        const match = entryFile.match(/src\/(.*)\/index\.js$/)
        const pageName = match && match[1]

        entry[pageName] = entryFile
        htmlWebpackPlugins.push(new HtmlWebpackPlugin({
            template: path.join(__dirname, `src/${pageName}/index.html`),
            filename: `${pageName}.html`,
            chunks: [pageName],
            // inject: true,
            // minify: {
            //     html5: true,
            //     collapseWhitespace: true,
            //     preserveLineBreaks: false,
            //     minifyCSS: true,
            //     minifyJS: true,
            //     removeComments: true
            // }
        }))
    })
    return {
        entry,
        htmlWebpackPlugins
    }
}

const { entry, htmlWebpackPlugins } = setMPA()

module.exports = (env, argv) => ({
    entry,
    output: {
        clean: true,
        path: path.join(__dirname, 'dist'),
        filename: '[name]/[name]_[chunkhash:8].js'
    },
    module: {
        rules: [
            {
                test: /.css$/,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /.less$/,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        'autoprefixer',
                                        {
                                            overrideBrowserslist: ['last 2 version', '>1%']
                                        }
                                    ]
                                ]
                            }
                        }
                    }
                ]
            },
            {
                test: /.js$/,
                use: 'babel-loader'
            },
            {
                test: /.(png|jpg|gif|jpeg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/[name]_[contenthash:8].[ext]'
                        }
                    }
                ]
            },
            // {
            //     test: /.(png|jpg|gif|jpeg)$/, use: [{
            //         loader: 'url-loader', options: {
            //             limit: 1024 * 8
            //         }
            //     }]
            // },
            {
                test: /.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[contenthash:8].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CssMinimizerPlugin(),
        new MiniCssExtractPlugin({
            filename: 'assets/css/[name]_[contenthash:8].css'
        }),
        ...htmlWebpackPlugins
    ],
    optimization: {
        //minimizer: [new CssMinimizerPlugin()]  // webpack认为，如果配置了minimizer，就表示开发者在自定义压缩插件，无论是配置minimizer是TRUE还是FALSE，内部的JS压缩器就会被覆盖掉
        minimizer: [new TerserPlugin({
            extractComments: false // 禁止生成注释到LICENSE.txt
        })]
    },
    devServer: {
        host: '0.0.0.0',
        open: true,
        hot: true,
        port: 8888,
        // static: './dist'
    },
    // devtool: argv.mode === 'development' ? 'source-map' : 'eval'
    devtool: 'source-map'
})
