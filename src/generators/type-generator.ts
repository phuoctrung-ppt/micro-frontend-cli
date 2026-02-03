import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectConfig } from '../types';

/**
 * Generate type definitions for remote modules
 */
export async function generateRemoteTypeDefinitions(
  projectPath: string,
  remoteName: string,
  exposes: Record<string, string>
): Promise<void> {
  const typesDir = path.join(projectPath, 'src', '@types');
  await fs.ensureDir(typesDir);

  const typeContent = generateTypeContent(remoteName, exposes);
  await fs.writeFile(
    path.join(typesDir, `${remoteName}.d.ts`),
    typeContent
  );
}

function generateTypeContent(remoteName: string, exposes: Record<string, string>): string {
  const moduleDeclarations = Object.keys(exposes).map(key => {
    const moduleName = key.replace('./', '');
    return `  export const ${moduleName}: React.ComponentType<any>;`;
  }).join('\n');

  return `/// <reference types="react" />

declare module '${remoteName}' {
${moduleDeclarations}
}

${Object.keys(exposes).map(key => {
  const path = key.replace('./', '');
  return `declare module '${remoteName}/${path}' {
  const component: React.ComponentType<any>;
  export default component;
}`;
}).join('\n\n')}
`;
}

/**
 * Generate shared types package for monorepo
 */
export async function generateSharedTypesPackage(
  rootPath: string,
  packageManager: string
): Promise<void> {
  const typesPath = path.join(rootPath, 'packages', 'shared-types');
  await fs.ensureDir(typesPath);
  await fs.ensureDir(path.join(typesPath, 'src'));

  // Generate package.json
  const packageJson = {
    name: '@micro-frontend/shared-types',
    version: '1.0.0',
    description: 'Shared TypeScript types for micro-frontend applications',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc',
      watch: 'tsc --watch'
    },
    devDependencies: {
      typescript: '^5.3.3',
      '@types/react': '^18.2.0'
    }
  };

  await fs.writeFile(
    path.join(typesPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Generate tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  await fs.writeFile(
    path.join(typesPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Generate index.ts
  const indexContent = `// Shared types for micro-frontend applications

export interface RemoteComponent {
  name: string;
  version: string;
  exposed: string[];
}

export interface HostConfig {
  remotes: RemoteReference[];
  sharedDependencies: string[];
}

export interface RemoteReference {
  name: string;
  url: string;
  scope: string;
}

export interface SharedDependencyConfig {
  singleton?: boolean;
  strictVersion?: boolean;
  requiredVersion?: string;
  eager?: boolean;
}

// Component prop types
export interface CommonComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Re-export for convenience
export type { ComponentType, FC, ReactNode } from 'react';
`;

  await fs.writeFile(
    path.join(typesPath, 'src', 'index.ts'),
    indexContent
  );

  // Generate README
  const readme = `# Shared Types

Shared TypeScript types and interfaces for the micro-frontend monorepo.

## Usage

In your packages, install the shared types:

\`\`\`bash
${packageManager} add @micro-frontend/shared-types@workspace:*
\`\`\`

Then import and use:

\`\`\`typescript
import { RemoteComponent, HostConfig } from '@micro-frontend/shared-types';
\`\`\`

## Building

\`\`\`bash
${packageManager} run build
\`\`\`

## Development

\`\`\`bash
${packageManager} run watch
\`\`\`
`;

  await fs.writeFile(path.join(typesPath, 'README.md'), readme);
}

/**
 * Add type references to host tsconfig
 */
export async function addTypeReferencesToHost(
  projectPath: string,
  remotes: string[]
): Promise<void> {
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');
  
  if (!await fs.pathExists(tsconfigPath)) {
    return;
  }

  const tsconfig = await fs.readJson(tsconfigPath);
  
  if (!tsconfig.compilerOptions) {
    tsconfig.compilerOptions = {};
  }

  if (!tsconfig.compilerOptions.paths) {
    tsconfig.compilerOptions.paths = {};
  }

  // Add path mappings for remotes
  remotes.forEach(remote => {
    tsconfig.compilerOptions.paths[`${remote}/*`] = [
      `./src/@types/${remote}.d.ts`
    ];
  });

  await fs.writeFile(
    tsconfigPath,
    JSON.stringify(tsconfig, null, 2)
  );
}

/**
 * Generate module federation types plugin config
 */
export function generateTypesPluginConfig(
  appName: string,
  isRemote: boolean
): string {
  return `
// Install: npm install @module-federation/typescript

const ModuleFederationTypesPlugin = require('@module-federation/typescript');

// Add to webpack plugins:
new ModuleFederationTypesPlugin({
  ${isRemote ? `
  // Remote: Generate types from exposed modules
  federationConfig: {
    name: '${appName}',
    filename: 'remoteEntry.js',
    exposes: {
      './App': './src/App',
    },
  },
  ` : `
  // Host: Download types from remotes
  remotes: {
    // Add your remotes here
  },
  `}
  typesOutputDir: './@mf-types',
  ${isRemote ? "generateAPITypes: true," : "downloadTypesWhenIdle: true,"}
}),
`;
}
