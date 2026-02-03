import { MicroFrontendConfig } from '../types/config';
import { sanitizeModuleFederationName } from '../utils/name-sanitizer';

/**
 * Generate micro-frontend.config.json for host app
 */
export function generateHostConfig(
  name: string,
  port: number,
  framework: 'react' | 'vue',
  remotes: Array<{ name: string; url: string }>
): MicroFrontendConfig {
  return {
    name: sanitizeModuleFederationName(name),
    type: 'host',
    port,
    framework,
    remotes: remotes.map(r => ({
      name: r.name,
      url: r.url,
      entry: 'remoteEntry.js'
    })),
    shared: generateSharedConfig(framework),
    build: {
      outputPath: 'dist',
      publicPath: 'auto'
    },
    devServer: {
      hot: true,
      historyApiFallback: true,
      cors: true
    }
  };
}

/**
 * Generate micro-frontend.config.json for remote app
 */
export function generateRemoteConfig(
  name: string,
  port: number,
  framework: 'react' | 'vue',
  exposes: Record<string, string> = { './App': './src/App' }
): MicroFrontendConfig {
  return {
    name: sanitizeModuleFederationName(name),
    type: 'remote',
    port,
    framework,
    exposes,
    shared: generateSharedConfig(framework),
    build: {
      outputPath: 'dist',
      publicPath: 'auto'
    },
    devServer: {
      hot: true,
      historyApiFallback: true,
      cors: true
    }
  };
}

function generateSharedConfig(framework: 'react' | 'vue'): Record<string, any> {
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
