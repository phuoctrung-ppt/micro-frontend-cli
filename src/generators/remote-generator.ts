import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectConfig } from '../types';
import { generateRemoteFederationConfig, generateWebpackConfig } from '../config/federation-config';
import { generatePackageJson } from '../utils/package-generator';
import { generateTsConfig } from '../utils/tsconfig-generator';
import { generateRemoteConfig } from '../config/config-generator';

export async function generateRemoteApp(config: ProjectConfig): Promise<void> {
  const projectPath = path.join(process.cwd(), config.name);

  // Create project structure
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'public'));
  await fs.ensureDir(path.join(projectPath, 'src', 'components'));

  // Default exposes configuration
  const exposes = {
    './App': './src/App',
  };

  // Generate micro-frontend.config.json
  const mfConfig = generateRemoteConfig(
    config.name,
    config.port,
    config.framework,
    exposes
  );
  await fs.writeFile(
    path.join(projectPath, 'micro-frontend.config.json'),
    JSON.stringify(mfConfig, null, 2)
  );

  // Copy webpack config template
  const webpackTemplatePath = path.join(__dirname, '../../src/templates/webpack.config.template.js');
  await fs.copyFile(
    webpackTemplatePath,
    path.join(projectPath, 'webpack.config.js')
  );

  // Generate package.json
  const packageJson = generatePackageJson(config, 'remote');
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Generate TypeScript config if needed
  if (config.typescript) {
    const tsConfig = generateTsConfig('remote', config.framework);
    await fs.writeFile(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  // Generate source files
  await generateRemoteSourceFiles(projectPath, config);

  // Generate README
  await generateRemoteReadme(projectPath, config);

  // Generate .gitignore
  await fs.writeFile(
    path.join(projectPath, '.gitignore'),
    generateGitignore()
  );
}

async function generateRemoteSourceFiles(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const ext = config.typescript ? 'tsx' : 'jsx';
  
  // Generate bootstrap file (for async boundary)
  const bootstrapContent = config.framework === 'react'
    ? generateReactBootstrap(config.typescript)
    : generateVueBootstrap(config.typescript);
  
  await fs.writeFile(
    path.join(projectPath, 'src', `bootstrap.${ext === 'tsx' ? 'tsx' : 'jsx'}`),
    bootstrapContent
  );

  // Generate index file (imports bootstrap)
  await fs.writeFile(
    path.join(projectPath, 'src', `index.${ext === 'tsx' ? 'ts' : 'js'}`),
    "import('./bootstrap');\n"
  );

  // Generate App component
  const appContent = config.framework === 'react'
    ? generateReactRemoteApp(config.typescript)
    : generateVueRemoteApp(config.typescript);
  
  await fs.writeFile(
    path.join(projectPath, 'src', `App.${ext}`),
    appContent
  );

  // Generate type exports for TypeScript
  if (config.typescript) {
    await fs.writeFile(
      path.join(projectPath, 'src', 'types.ts'),
      generateRemoteTypeExports()
    );
  }

  // Generate sample component
  const componentContent = config.framework === 'react'
    ? generateReactComponent(config.typescript)
    : generateVueComponent(config.typescript);
  
  await fs.writeFile(
    path.join(projectPath, 'src', 'components', `Counter.${ext}`),
    componentContent
  );

  // Generate HTML template
  await fs.writeFile(
    path.join(projectPath, 'public', 'index.html'),
    generateHtmlTemplate(config.name)
  );

  // Generate type declarations if TypeScript
  if (config.typescript) {
    await fs.writeFile(
      path.join(projectPath, 'src', 'types.d.ts'),
      generateTypeDeclarations()
    );
  }
}

function generateReactBootstrap(typescript: boolean): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root')${typescript ? ' as HTMLElement' : ''}
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function generateReactRemoteApp(typescript: boolean): string {
  return `import React from 'react';
import Counter from './components/Counter';

${typescript ? 'const App: React.FC = () => {' : 'function App() {'}
  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      margin: '20px 0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>📦 Remote Application</h2>
      <p>This component is loaded from a remote micro-frontend.</p>
      
      <Counter />
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        background: '#f0f0f0',
        borderRadius: '4px'
      }}>
        <small>🔌 Loaded via Module Federation</small>
      </div>
    </div>
  );
}${typescript ? '' : '\n'}

export default App;
`;
}

function generateReactComponent(typescript: boolean): string {
  return `import React, { useState } from 'react';

${typescript ? 'const Counter: React.FC = () => {' : 'function Counter() {'}
  const [count, setCount] = useState(0);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Counter Component</h3>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        marginTop: '10px'
      }}>
        <button 
          onClick={() => setCount(count - 1)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          -
        </button>
        <span style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          minWidth: '50px',
          textAlign: 'center'
        }}>
          {count}
        </span>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}${typescript ? '' : '\n'}

export default Counter;
`;
}

function generateVueBootstrap(typescript: boolean): string {
  return `import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#root');
`;
}

function generateVueRemoteApp(typescript: boolean): string {
  return `<template>
  <div style="padding: 20px; border: 2px solid #4CAF50; border-radius: 8px; margin: 20px 0; font-family: Arial, sans-serif">
    <h2>📦 Remote Application</h2>
    <p>This component is loaded from a remote micro-frontend.</p>
    
    <Counter />
    
    <div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px">
      <small>🔌 Loaded via Module Federation</small>
    </div>
  </div>
</template>

<script${typescript ? ' lang="ts"' : ''}>
import { defineComponent } from 'vue';
import Counter from './components/Counter.vue';

export default defineComponent({
  name: 'App',
  components: {
    Counter
  }
});
</script>
`;
}

function generateVueComponent(typescript: boolean): string {
  return `<template>
  <div style="margin-top: 20px">
    <h3>Counter Component</h3>
    <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px">
      <button 
        @click="decrement"
        style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px"
      >
        -
      </button>
      <span style="font-size: 24px; font-weight: bold; min-width: 50px; text-align: center">
        {{ count }}
      </span>
      <button 
        @click="increment"
        style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px"
      >
        +
      </button>
    </div>
  </div>
</template>

<script${typescript ? ' lang="ts"' : ''}>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Counter',
  setup() {
    const count = ref(0);

    const increment = () => {
      count.value++;
    };

    const decrement = () => {
      count.value--;
    };

    return {
      count,
      increment,
      decrement
    };
  }
});
</script>
`;
}

function generateHtmlTemplate(appName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;
}

function generateTypeDeclarations(): string {
  return `/// <reference types="react" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
`;
}

function generateRemoteTypeExports(): string {
  return `/**
 * Type definitions for exposed components.
 * Export these types so host applications can import them.
 * 
 * Usage in host:
 * import type { AppProps } from 'remoteApp/types';
 */

export interface AppProps {
  // Add props here if your App component accepts any
}

export interface CounterProps {
  initialValue?: number;
  onChange?: (value: number) => void;
}

/**
 * Best Practice: Export all component prop types here.
 * This allows host applications to:
 * 1. Import types: import type { AppProps } from 'remoteApp/types'
 * 2. Get autocomplete and type checking
 * 3. Catch type errors at compile time
 */
`;
}

function generateGitignore(): string {
  return `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.vscode/
.idea/
*.swp
coverage/
.cache/
`;
}

async function generateRemoteReadme(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const readme = `# ${config.name}

Remote application for micro-frontend architecture using Webpack Module Federation.

## Overview

This is a remote micro-frontend that exposes components to be consumed by a host application.

### Exposed Modules

- \`./App\` - Main application component

## Getting Started

### Installation

\`\`\`bash
${config.packageManager} install
\`\`\`

### Development

\`\`\`bash
${config.packageManager} start
\`\`\`

The application will be available at http://localhost:${config.port}

### Build

\`\`\`bash
${config.packageManager} run build
\`\`\`

## Consuming This Remote

Add this remote to your host application's \`webpack.config.js\`:

\`\`\`javascript
remotes: {
  ${config.name}: '${config.name}@http://localhost:${config.port}/remoteEntry.js',
}
\`\`\`

Then import and use in your host:

\`\`\`${config.typescript ? 'tsx' : 'jsx'}
const RemoteApp = React.lazy(() => import('${config.name}/App'));

<Suspense fallback={<div>Loading...</div>}>
  <RemoteApp />
</Suspense>
\`\`\`

## Exposing New Modules

1. Create your component in \`src/components/\`
2. Update \`webpack.config.js\` exposes:

\`\`\`javascript
exposes: {
  './App': './src/App',
  './NewComponent': './src/components/NewComponent',
}
\`\`\`

3. Use in host application:

\`\`\`${config.typescript ? 'tsx' : 'jsx'}
const NewComponent = React.lazy(() => import('${config.name}/NewComponent'));
\`\`\`

## Project Structure

\`\`\`
${config.name}/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Counter.${config.typescript ? 'tsx' : 'jsx'}
│   ├── App.${config.typescript ? 'tsx' : 'jsx'}
│   ├── bootstrap.${config.typescript ? 'tsx' : 'jsx'}
│   └── index.${config.typescript ? 'ts' : 'js'}
├── webpack.config.js
├── package.json
${config.typescript ? '└── tsconfig.json\n' : ''}
\`\`\`

## Best Practices

- **Async Boundary**: Uses \`bootstrap.${config.typescript ? 'tsx' : 'jsx'}\` for proper module federation initialization
- **Shared Dependencies**: React/Vue configured as singleton to prevent duplication
- **Type Safety**: ${config.typescript ? 'TypeScript types are automatically generated' : 'Consider migrating to TypeScript for better type safety'}
- **Error Handling**: Host should implement error boundaries for graceful fallbacks

## Learn More

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Micro Frontend Architecture](https://micro-frontends.org/)
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}
