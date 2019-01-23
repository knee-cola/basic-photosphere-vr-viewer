const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs')
  },
  devServer: {
    contentBase: './docs',
    host: '0.0.0.0', // listen on all IP addresses
    port: 8080,
    https: true // needed for the WakeLock API to work (in Chrome)
  },
};