import { ModuleFederationConfig, SharedDependency } from '../types';

/**
 * Get shared dependencies configuration based on framework
 */
export function getSharedDependencies(framework: 'react' | 'vue'): Record<string, SharedDependency> {
  if (framework === 'react') {
    return {
      react: {
        singleton: true,
        requiredVersion: '^18.0.0',
        strictVersion: false,
        eager: false
      },
      'react-dom': {
        singleton: true,
        requiredVersion: '^18.0.0',
        strictVersion: false,
        eager: false
      }
    };
  } else {
    return {
      vue: {
        singleton: true,
        requiredVersion: '^3.0.0',
        strictVersion: false,
        eager: false
      }
    };
  }
}

/**
 * Generate Module Federation config for host app
 */
export function generateHostFederationConfig(
  name: string,
  remotes: Array<{ name: string; url: string }>,
  framework: 'react' | 'vue'
): ModuleFederationConfig {
  const remotesConfig: Record<string, string> = {};
  
  remotes.forEach(remote => {
    remotesConfig[remote.name] = remote.url;
  });

  return {
    name,
    filename: 'remoteEntry.js',
    remotes: remotesConfig,
    shared: getSharedDependencies(framework)
  };
}

/**
 * Generate Module Federation config for remote app
 */
export function generateRemoteFederationConfig(
  name: string,
  exposes: Record<string, string>,
  framework: 'react' | 'vue'
): ModuleFederationConfig {
  return {
    name,
    filename: 'remoteEntry.js',
    exposes,
    shared: getSharedDependencies(framework)
  };
}

/**
 * Generate webpack config string for Module Federation
 */
export function generateWebpackConfig(
  config: ModuleFederationConfig,
  port: number,
  typescript: boolean
): string {
  const sharedString = JSON.stringify(config.shared, null, 6);
  const remotesString = config.remotes ? JSON.stringify(config.remotes, null, 6) : undefined;
  const exposesString = config.exposes ? JSON.stringify(config.exposes, null, 6) : undefined;

  return `const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
${typescript ? "const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');" : ''}

module.exports = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: ${port},
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: [${typescript ? "'.ts', '.tsx', " : ''}'.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx${typescript ? '|ts|tsx' : ''})$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              ${typescript ? "'@babel/preset-typescript'," : ''}
            ],
          },
        },
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: '${config.name}',
      filename: '${config.filename}',${remotesString ? `\n      remotes: ${remotesString},` : ''}${exposesString ? `\n      exposes: ${exposesString},` : ''}
      shared: ${sharedString},
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),${typescript ? "\n    new ForkTsCheckerWebpackPlugin()," : ''}
  ],
};
`;
}
