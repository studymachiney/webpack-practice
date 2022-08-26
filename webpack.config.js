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
const cacheGroups = {
    'third-vendor': {
        chunks: 'all',
        test: /[\\/]node_modules[\\/]lodash[\\/]/,
        name: 'third-vendor',
        priority: 1
    },
    'react-vendor': {
        chunks: 'all',
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react-vendor',
        priority: 1
    }
}
module.exports = (env, argv) => ({
    entry,
    output: {
        clean: true,
        publicPath: argv.mode === 'development' ? '/' : './',
        path: path.join(__dirname, 'dist'),
        // filename: '[name]/[name]_[chunkhash:8].js',
        filename: pathData => {
            if (cacheGroups[pathData.chunk.name] || pathData.chunk.name === 'other-vendor') {
                return 'vendors/[name]_[chunkhash:8].js'
            } else {
                return '[name]/index_[chunkhash:8].js'
            }
        },
        assetModuleFilename: 'images/[name]_[hash].[ext]'
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
                type: 'asset',
                generator: {
                    filename: pathData => {
                        const module = pathData.filename.match(
                            /src\/(.+?)\//
                        )
                        console.log(module);
                        if (module) {
                            return `${module[1]}/assets/images/[name].[contenthash:10][ext][query]`
                        } else {
                            return `assets/images/[name].[ext]`
                        }
                    }
                },
                // parser: {
                //     dataUrlCondition: {
                //         maxSize: 1024 // default 8 * 1024
                //     }
                // }
            },
            {
                test: /.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/resource',
                generator: {
                    filename: pathData => {
                        const module = pathData.filename.match(
                            /src\/(.+?)\//
                        )
                        if (module) {
                            return `${module[1]}/assets/fonts/[name].[contenthash:10][ext][query]`
                        } else {
                            return `assets/fonts/[name].[ext]`
                        }
                    },
                    publicPath: argv.mode === 'development' ? '/' : '../../'
                },
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
            extractComments: false, // 禁止生成注释到LICENSE.txt

        })],
        splitChunks: {
            chunks: 'all',
            name: 'other-vendor',
            minSize: 0,
            cacheGroups
        },
        // runtimeChunk: 'single'
        // splitChunks: {
        //     minSize: 0, // 引用模块大小限制
        //     cacheGroups: {
        //         commons: {
        //             test: /(react|react-dom)/,
        //             name: 'vendors',
        //             chunks: 'all',
        //             minChunks: 2 // 最小引用次数
        //         }
        //     }
        // }
    },
    devServer: {
        host: '0.0.0.0',
        open: true,
        hot: true,
        port: 8888,
        static: './dist'
    },
    devtool: argv.mode === 'development' ? 'source-map' : undefined
})
