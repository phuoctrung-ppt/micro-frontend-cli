import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectConfig, RemoteReference } from '../types';
import { generateHostFederationConfig, generateWebpackConfig } from '../config/federation-config';
import { generatePackageJson } from '../utils/package-generator';
import { generateTsConfig } from '../utils/tsconfig-generator';
import { generateHostConfig } from '../config/config-generator';

export async function generateHostApp(
  config: ProjectConfig,
  remotes: RemoteReference[]
): Promise<void> {
  const projectPath = path.join(process.cwd(), config.name);

  // Create project structure
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'public'));
  await fs.ensureDir(path.join(projectPath, 'src', 'components'));

  // Generate micro-frontend.config.json
  const mfConfig = generateHostConfig(config.name, config.port, config.framework, remotes);
  await fs.writeFile(
    path.join(projectPath, 'micro-frontend.config.json'),
    JSON.stringify(mfConfig, null, 2)
  );

  // Copy webpack config template
  const webpackTemplatePath = path.join(
    __dirname,
    '../../src/templates/webpack.config.template.js'
  );
  await fs.copyFile(webpackTemplatePath, path.join(projectPath, 'webpack.config.js'));

  // Generate package.json
  const packageJson = generatePackageJson(config, 'host');
  await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Generate TypeScript config if needed
  if (config.typescript) {
    const tsConfig = generateTsConfig('host', config.framework);
    await fs.writeFile(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  }

  // Generate source files
  await generateHostSourceFiles(projectPath, config, remotes);

  // Generate README
  await generateHostReadme(projectPath, config, remotes);

  // Generate .gitignore
  await fs.writeFile(path.join(projectPath, '.gitignore'), generateGitignore());

  // Generate environment file
  await generateEnvFile(projectPath, remotes);
}

async function generateHostSourceFiles(
  projectPath: string,
  config: ProjectConfig,
  remotes: RemoteReference[]
): Promise<void> {
  const ext = config.typescript ? 'tsx' : 'jsx';

  // Generate bootstrap file (for async boundary)
  const bootstrapContent =
    config.framework === 'react'
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
  const appContent =
    config.framework === 'react'
      ? generateReactApp(remotes, config.typescript)
      : generateVueApp(remotes, config.typescript);

  await fs.writeFile(path.join(projectPath, 'src', `App.${ext}`), appContent);

  // Generate HTML template
  await fs.writeFile(
    path.join(projectPath, 'public', 'index.html'),
    generateHtmlTemplate(config.name)
  );

  // Generate error boundary if React
  if (config.framework === 'react') {
    await fs.writeFile(
      path.join(projectPath, 'src', 'components', `ErrorBoundary.${ext}`),
      generateErrorBoundary(config.typescript)
    );
  }

  // Generate type declarations for remotes if TypeScript
  if (config.typescript && remotes.length > 0) {
    await fs.writeFile(path.join(projectPath, 'src', 'remotes.d.ts'), generateRemoteTypes(remotes));
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

function generateVueBootstrap(typescript: boolean): string {
  return `import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#root');
`;
}

function generateReactApp(remotes: RemoteReference[], typescript: boolean): string {
  const imports = remotes
    .map(
      (remote) =>
        `const ${remote.name.charAt(0).toUpperCase() + remote.name.slice(1)} = React.lazy(() => import('${remote.name}/App'));`
    )
    .join('\n');

  return `import React${remotes.length > 0 ? ', { Suspense }' : ''} from 'react';
import ErrorBoundary from './components/ErrorBoundary';
${imports}

${typescript ? 'const App: React.FC = () => {' : 'function App() {'}
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Host Application</h1>
      <p>This is your micro-frontend host application.</p>
      
      ${
        remotes.length > 0
          ? `
      <div style={{ marginTop: '40px' }}>
        <h2>Remote Applications:</h2>
        ${remotes
          .map(
            (remote) => `
        <ErrorBoundary>
          <Suspense fallback={<div>Loading ${remote.name}...</div>}>
            <${remote.name.charAt(0).toUpperCase() + remote.name.slice(1)} />
          </Suspense>
        </ErrorBoundary>
        `
          )
          .join('\n        ')}
      </div>
      `
          : `
      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>No remotes configured yet</h3>
        <p>Add remote applications in your webpack.config.js</p>
      </div>
      `
      }
    </div>
  );
}${typescript ? '' : '\n'}

export default App;
`;
}

function generateVueApp(remotes: RemoteReference[], typescript: boolean): string {
  return `<template>
  <div style="padding: 20px; font-family: Arial, sans-serif">
    <h1>🚀 Host Application</h1>
    <p>This is your micro-frontend host application.</p>
    
    ${
      remotes.length > 0
        ? `
    <div style="margin-top: 40px">
      <h2>Remote Applications:</h2>
      ${remotes
        .map(
          (remote) => `
      <Suspense>
        <template #default>
          <${remote.name} />
        </template>
        <template #fallback>
          <div>Loading ${remote.name}...</div>
        </template>
      </Suspense>
      `
        )
        .join('\n      ')}
    </div>
    `
        : `
    <div style="margin-top: 40px; padding: 20px; background: #f0f0f0; border-radius: 8px">
      <h3>No remotes configured yet</h3>
      <p>Add remote applications in your webpack.config.js</p>
    </div>
    `
    }
  </div>
</template>

<script${typescript ? ' lang="ts"' : ''}>
import { defineComponent } from 'vue';
${remotes.map((r) => `import ${r.name} from '${r.name}/App';`).join('\n')}

export default defineComponent({
  name: 'App',
  components: {
    ${remotes.map((r) => r.name).join(',\n    ')}
  }
});
</script>
`;
}

function generateErrorBoundary(typescript: boolean): string {
  return `import React, { Component${typescript ? ', ReactNode' : ''} } from 'react';

${
  typescript
    ? `
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}
`
    : ''
}

class ErrorBoundary extends Component${typescript ? '<Props, State>' : ''} {
  ${typescript ? '' : 'constructor(props) {\n    super(props);\n    this.state = { hasError: false, error: null };\n  }\n\n  '}${typescript ? 'state: State = { hasError: false, error: null };\n\n  ' : ''}static getDerivedStateFromError(error${typescript ? ': Error' : ''})${typescript ? ': State' : ''} {
    return { hasError: true, error };
  }

  componentDidCatch(error${typescript ? ': Error' : ''}, errorInfo${typescript ? ': React.ErrorInfo' : ''}) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px 0',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          background: '#ffe0e0'
        }}>
          <h3>⚠️ Remote Loading Error</h3>
          <p>Failed to load remote application.</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Error details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
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

function generateRemoteTypes(remotes: RemoteReference[]): string {
  return `/// <reference types="react" />

/**
 * Type declarations for remote micro-frontend modules.
 * 
 * Best Practices:
 * 1. Update these types when remote exports change
 * 2. Use specific prop types instead of 'any' for type safety
 * 3. Consider using a shared types package in monorepo setups
 * 4. Remotes should export their types (see remote's src/types.ts)
 */

${remotes
  .map(
    (remote) => `
// Types for ${remote.name} remote
declare module '${remote.name}/App' {
  const App: React.ComponentType<any>;
  export default App;
}

// Wildcard for other exports from ${remote.name}
declare module '${remote.name}/*' {
  const component: React.ComponentType<any>;
  export default component;
}
`
  )
  .join('\n')}

/**
 * Example: Define specific prop types for better type safety
 * 
 * declare module 'remoteApp/UserProfile' {
 *   interface UserProfileProps {
 *     userId: string;
 *     onUpdate?: (user: User) => void;
 *   }
 *   const UserProfile: React.ComponentType<UserProfileProps>;
 *   export default UserProfile;
 * }
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

async function generateEnvFile(projectPath: string, remotes: RemoteReference[]): Promise<void> {
  const envContent = `# Development
NODE_ENV=development
PORT=3000

# Remote URLs (Development)
${remotes.map((remote) => `${remote.name.toUpperCase()}_URL=${remote.url}`).join('\n')}

# Remote URLs (Production)
# Update these for production deployment
${remotes.map((remote) => `${remote.name.toUpperCase()}_URL_PROD=https://your-domain.com/${remote.name}/remoteEntry.js`).join('\n')}
`;

  await fs.writeFile(path.join(projectPath, '.env.example'), envContent);
}

async function generateHostReadme(
  projectPath: string,
  config: ProjectConfig,
  remotes: RemoteReference[]
): Promise<void> {
  const readme = `# ${config.name}

Host application for micro-frontend architecture using Webpack Module Federation.

## Overview

This is the host (shell) application that loads and orchestrates remote micro-frontends.

### Configured Remotes

${remotes.length > 0 ? remotes.map((r) => `- **${r.name}**: ${r.url}`).join('\n') : 'No remotes configured yet.'}

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

## Adding Remote Applications

1. Update \`webpack.config.js\` remotes configuration:

\`\`\`javascript
remotes: {
  remoteName: 'remoteName@http://localhost:3001/remoteEntry.js',
}
\`\`\`

2. Import and use in your components:

\`\`\`${config.typescript ? 'tsx' : 'jsx'}
const RemoteApp = React.lazy(() => import('remoteName/App'));

<Suspense fallback={<div>Loading...</div>}>
  <RemoteApp />
</Suspense>
\`\`\`

## Project Structure

\`\`\`
${config.name}/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── ErrorBoundary.${config.typescript ? 'tsx' : 'jsx'}
│   ├── App.${config.typescript ? 'tsx' : 'jsx'}
│   ├── index.${config.typescript ? 'tsx' : 'jsx'}
${config.typescript ? '│   └── remotes.d.ts\n' : ''}├── webpack.config.js
├── package.json
${config.typescript ? '└── tsconfig.json\n' : ''}
\`\`\`

## Environment Variables

Copy \`.env.example\` to \`.env\` and update the remote URLs as needed.

## Learn More

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Micro Frontend Architecture](https://micro-frontends.org/)
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}
