const HtmlWebPackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html",
  inlineSource: '.(js|css)$'
});
const htmlWebpackInlineSourcePlugin = new HtmlWebpackInlineSourcePlugin();

module.exports = (env, options) => {
    return {
        performance: {
            hints: false,
        },        
        devtool: options.mode === "development" && "inline-source-map" || undefined, // Enable source maps in dev mode.
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                    exclude: "/node_modules/"
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: "style-loader"
                        },
                        {
                            loader: "css-loader"
                        }
                    ]
                }
            ],
        },
        resolve: {
          extensions: [ '.tsx', '.ts', '.js' ],
        },
        plugins: [htmlWebpackPlugin, htmlWebpackInlineSourcePlugin]
    };
};