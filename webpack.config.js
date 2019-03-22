const resolve = require('path').resolve; // eslint-disable-line

// Minimal Webpack config to supply to Eslint.
// This is not actually used by Nuxt but instead mirrors
// the resolve and loader rules.
module.exports = {
    resolve: {
        // modules: [resolve(__dirname, 'lib'), 'node_modules'],
        extensions: ['.js', '.vue'],
        alias: {
            '~': resolve(__dirname, './'),
            '@': resolve(__dirname, './')
            // your aliases go here.
        }
    },

    /*module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: 'vue-loader'
            }
        ]
    }*/
};
