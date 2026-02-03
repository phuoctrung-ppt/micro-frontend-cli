const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const fs = require('fs');

// Read micro-frontend.config.json
const configPath = path.resolve(__dirname, 'micro-frontend.config.json');
const mfConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Build remotes object for host
const remotes = {};
if (mfConfig.type === 'host' && mfConfig.remotes) {
  mfConfig.remotes.forEach(remote => {
    remotes[remote.name] = `${remote.name}@${remote.url}`;
  });
}

// Build Module Federation config
const moduleFederationConfig = {
  name: mfConfig.name,
  filename: 'remoteEntry.js',
  ...(mfConfig.type === 'remote' && mfConfig.exposes ? { exposes: mfConfig.exposes } : {}),
  ...(mfConfig.type === 'host' && Object.keys(remotes).length > 0 ? { remotes } : {}),
  shared: mfConfig.shared || {}
};

module.exports = {
  entry: './src/index',
  mode: process.env.NODE_ENV || 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, mfConfig.build?.outputPath || 'dist'),
    },
    port: mfConfig.port,
    historyApiFallback: mfConfig.devServer?.historyApiFallback !== false,
    hot: mfConfig.devServer?.hot !== false,
    headers: mfConfig.devServer?.cors !== false ? {
      'Access-Control-Allow-Origin': '*',
    } : {},
  },
  output: {
    path: path.resolve(__dirname, mfConfig.build?.outputPath || 'dist'),
    publicPath: mfConfig.build?.publicPath || 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
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
    new ModuleFederationPlugin(moduleFederationConfig),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
