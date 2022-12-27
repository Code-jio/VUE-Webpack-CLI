const path = require("path");

const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require("webpack");

const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");

// 判断生产环境还是开发环境 由cross-env插件定义
const isProdution = process.env.NODE_ENV === "production"

// 返回处理样式的loader函数
const getStyleLoader = (pre) => {
    return [
        isProdution ? MiniCssExtractPlugin.loader : "vue-style-loader",
        "css-loader",
        {
            // 处理css兼容性问题 
            // 配合package.json中的browerslist指定兼容性
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env"
                    ]
                }
            }
        },
        pre && {
            loader: pre,
            options: pre === "sass-loader" ? {
                additionalData: `@use "@/styles/element/index.scss" as *;`,
            }
                : {}
        }
    ].filter(Boolean) // filter(Boolean) 过滤掉undefined值 
}

module.exports = {
    entry: "./src/main.js",
    output: {
        path: isProdution ? path.resolve(__dirname, "../dist") : undefined,
        filename: isProdution ? "static/js/[name].[contenthash:10].js" : "static/js/[name].js",
        chunkFilename: isProdution ? "static/js/[name].[contenthash:10].chunk.js" : "static/js/[name].chunk.js",
        assetModuleFilename: "static/media/[hash:10][query]",
        clean: true
    },
    module: {
        rules: [
            // 处理css
            {
                test: /\.css$/,
                use: getStyleLoader()
            },
            {
                test: /\.less$/,
                use: getStyleLoader("less-loader")
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoader("sass-loader")
            },
            {
                test: /\.styl$/,
                use: getStyleLoader("stylus-loader")
            },
            // 处理图片
            {
                test: /\.(jpe?g|png|gif|webp|svg)$/,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    }
                }
            },
            // 处理其他资源
            {
                test: /\.(woff2?|ttf)$/,
                type: "asset/resource"
            },
            // 处理js
            {
                test: /\.js$/,
                include: path.resolve(__dirname, "../src"),
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,

                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    // 开启缓存
                    cacheDirectory: path.resolve(
                        __dirname,
                        "node_modules/.cache/vue-loader"
                    ),
                },
            }
        ]
    },
    // 处理HTML
    plugins: [
        new ESLintWebpackPlugin(
            {
                context: path.resolve(__dirname, "../src"),
                cache: true,
                cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache")
            }
        ),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html")
        }),
        isProdution && new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash:10].css",
            chunkFilename: "static/css/[name].[contenthash:10].chunk.css"
        }),
        isProdution && new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "../public"),
                    to: path.resolve(__dirname, "../dist"),
                    toType: "dir",
                    noErrorOnMissing: true, // 不生成错误
                    globOptions: {
                        // 忽略文件
                        ignore: ["**/index.html"],
                    },
                    info: {
                        // 跳过terser压缩js
                        minimized: true,
                    },
                },
            ],
        }),
        new VueLoaderPlugin(),
        // cross-env 定义的环境变量给webpack使用
        // DefinedPlugin 定义环境变量给源代码使用，从而解决vue3页面报警告问题
        new DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false,
        }),
        // 按需加载element-plus组件样式
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [
                ElementPlusResolver({
                    importStyle: "sass" // 自定义主题
                })
            ]
        })
    ].filter(Boolean),
    mode: isProdution ? "production" : "development",
    devtool: isProdution ? "source-map" : "cheap-module-source-map",
    optimization: {
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                // layouts通常是admin项目的主体布局组件，所有路由组件都要使用的
                // 可以单独打包，从而复用
                // 如果项目中没有，请删除
                layouts: {
                    name: "layouts",
                    test: path.resolve(__dirname, "../src/layouts"),
                    priority: 40,
                },
                // 如果项目中使用element-plus，此时将所有node_modules打包在一起，那么打包输出文件会比较大。
                // 所以我们将node_modules中比较大的模块单独打包，从而并行加载速度更好
                // 如果项目中没有，请删除
                elementUI: {
                    name: "chunk-elementPlus",
                    test: /[\\/]node_modules[\\/]_?element-plus(.*)/,
                    priority: 30,
                },
                // 将vue相关的库单独打包，减少node_modules的chunk体积。
                vue: {
                    name: "vue",
                    test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
                    chunks: "initial",
                    priority: 20,
                },
                libs: {
                    name: "chunk-libs",
                    test: /[\\/]node_modules[\\/]/,
                    priority: 10, // 权重最低，优先考虑前面内容
                    chunks: "initial",
                },
            },
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`
        },
        minimize: isProdution,
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserWebpackPlugin(),
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            [
                                "svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                            name: "sortAttrs",
                                            params: {
                                                xmlnsOrder: "alphabetical",
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ]
    },
    // webpack解析模块加载选项
    resolve: {
        // 自动补全文件扩展名
        extensions: [".vue", ".js", ".json"],
        alias: {
            // 路径别名
            "@": path.resolve(__dirname, "../src")
        }
    },
    devServer: {
        host: "0.0.0.0",
        port: 3000,
        open: true,
        hot: true,
        historyApiFallback: true, // 解决react-router刷新
    },
    performance: false
}