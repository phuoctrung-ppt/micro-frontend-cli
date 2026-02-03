import { ProjectConfig } from '../types';

export function generatePackageJson(
  config: ProjectConfig,
  type: 'host' | 'remote'
): Record<string, any> {
  const basePackage = {
    name: config.name,
    version: '1.0.0',
    description: `${type === 'host' ? 'Host' : 'Remote'} application for micro-frontend`,
    private: true,
    scripts: {
      start: 'webpack serve --open',
      dev: 'webpack serve',
      build: 'webpack --mode production',
      clean: 'rm -rf dist'
    },
    dependencies: getDependencies(config),
    devDependencies: getDevDependencies(config)
  };

  return basePackage;
}

function getDependencies(config: ProjectConfig): Record<string, string> {
  const deps: Record<string, string> = {};

  if (config.framework === 'react') {
    deps['react'] = '^18.2.0';
    deps['react-dom'] = '^18.2.0';
  } else if (config.framework === 'vue') {
    deps['vue'] = '^3.4.0';
  }

  return deps;
}

function getDevDependencies(config: ProjectConfig): Record<string, string> {
  const devDeps: Record<string, string> = {
    'webpack': '^5.89.0',
    'webpack-cli': '^5.1.4',
    'webpack-dev-server': '^4.15.1',
    'html-webpack-plugin': '^5.6.0',
    'babel-loader': '^9.1.3',
    '@babel/core': '^7.23.7',
    '@babel/preset-env': '^7.23.7',
    '@babel/preset-react': '^7.23.3',
    'style-loader': '^3.3.4',
    'css-loader': '^6.9.0'
  };

  if (config.typescript) {
    devDeps['typescript'] = '^5.3.3';
    devDeps['@babel/preset-typescript'] = '^7.23.3';
    devDeps['fork-ts-checker-webpack-plugin'] = '^9.0.2';

    if (config.framework === 'react') {
      devDeps['@types/react'] = '^18.2.48';
      devDeps['@types/react-dom'] = '^18.2.18';
    }
  }

  if (config.framework === 'vue') {
    devDeps['vue-loader'] = '^17.4.2';
    devDeps['@vue/compiler-sfc'] = '^3.4.0';
  }

  return devDeps;
}
