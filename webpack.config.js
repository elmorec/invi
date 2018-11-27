const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const pkg = require('./package.json');

const task = process.env.npm_lifecycle_event;
const isDev = task === 'start';
const components = ['collapse', 'toast', 'modal', 'tab', 'carousel'];

module.exports = {
  mode: 'production',
  entry: (components => {
    let entry = {};
    components.forEach(name => entry[name] = './src/components/' + name);

    return entry;
  })(components.concat('index')),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: pkg.name.replace(/^./, match => match.toUpperCase()),
    libraryTarget: 'umd',
  },

  module: {
    rules: [
      { test: /\.(js|ts)$/, loader: 'ts-loader', exclude: /node_modules/ },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(['dist'], { watch: isDev }),
  ],

  resolve: {
    extensions: ['.ts', '.js', '.json']
  },

  devtool: isDev ? 'source-map' : 'none',

  watch: isDev,

  node: {
    fs: 'empty',
    global: false,
    crypto: 'empty',
    tls: 'empty',
    net: 'empty',
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false,
    Buffer: false
  },
};
