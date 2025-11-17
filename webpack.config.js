const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'background/service-worker': './src/background/service-worker.js',
    'content/activity-tracker': './src/content/activity-tracker.js',
    'popup/popup': './src/popup/popup.js',
    'dashboard/dashboard': './src/dashboard/dashboard.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'index.html', to: 'index.html' },
        { from: 'landing.js', to: 'landing.js' },
        { from: 'src/popup/popup.html', to: 'popup/popup.html' },
        { from: 'src/popup/popup.css', to: 'popup/popup.css' },
        { from: 'src/dashboard/dashboard.html', to: 'dashboard/dashboard.html' },
        { from: 'src/dashboard/dashboard.css', to: 'dashboard/dashboard.css' },
        { from: 'src/assets', to: 'assets' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
  optimization: {
    minimize: false, // Keep code readable for debugging
  },
};
