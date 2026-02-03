import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectConfig, RemoteReference } from '../types';
import { generateHostApp } from './host-generator';
import { generateRemoteApp } from './remote-generator';
import { generateSharedTypesPackage } from './type-generator';

export async function setupMonorepo(
  config: ProjectConfig,
  remotes: RemoteReference[]
): Promise<void> {
  const rootPath = path.join(process.cwd(), config.name);

  // Create monorepo structure
  await fs.ensureDir(rootPath);
  await fs.ensureDir(path.join(rootPath, 'packages'));

  // Generate root package.json
  await generateRootPackageJson(rootPath, config);

  // Generate workspace configuration
  switch (config.monorepoTool) {
    case 'pnpm':
      await generatePnpmWorkspace(rootPath);
      break;
    case 'nx':
      await generateNxWorkspace(rootPath, config);
      break;
    case 'turborepo':
      await generateTurborepoConfig(rootPath, config);
      break;
  }

  // Generate the main app
  if (config.type === 'host') {
    await generateHostInMonorepo(rootPath, config, remotes);
  } else {
    await generateRemoteInMonorepo(rootPath, config);
  }

  // Generate shared types package if TypeScript
  if (config.typescript) {
    await generateSharedTypesPackage(rootPath, config.packageManager);
  }

  // Generate root README
  await generateMonorepoReadme(rootPath, config);

  // Generate .gitignore
  await fs.writeFile(
    path.join(rootPath, '.gitignore'),
    generateGitignore()
  );
}

async function generateRootPackageJson(
  rootPath: string,
  config: ProjectConfig
): Promise<void> {
  const packageJson = {
    name: config.name,
    version: '1.0.0',
    private: true,
    description: 'Micro-frontend monorepo',
    scripts: {
      dev: config.monorepoTool === 'pnpm' 
        ? 'pnpm --parallel --stream -r dev'
        : config.monorepoTool === 'nx'
        ? 'nx run-many --target=dev --all'
        : 'turbo run dev',
      build: config.monorepoTool === 'pnpm'
        ? 'pnpm -r build'
        : config.monorepoTool === 'nx'
        ? 'nx run-many --target=build --all'
        : 'turbo run build',
      clean: config.monorepoTool === 'pnpm'
        ? 'pnpm -r exec rm -rf dist node_modules'
        : config.monorepoTool === 'nx'
        ? 'nx reset && rm -rf dist node_modules'
        : 'turbo clean',
      install: `${config.packageManager} install`
    },
    workspaces: config.monorepoTool === 'pnpm' ? undefined : ['packages/*'],
    devDependencies: config.monorepoTool === 'nx' ? {
      'nx': '^18.0.0',
      '@nx/workspace': '^18.0.0'
    } : config.monorepoTool === 'turborepo' ? {
      'turbo': '^1.12.0'
    } : {}
  };

  await fs.writeFile(
    path.join(rootPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

async function generatePnpmWorkspace(rootPath: string): Promise<void> {
  const workspaceContent = `packages:
  - 'packages/*'
`;

  await fs.writeFile(
    path.join(rootPath, 'pnpm-workspace.yaml'),
    workspaceContent
  );
}

async function generateNxWorkspace(
  rootPath: string,
  config: ProjectConfig
): Promise<void> {
  const nxConfig = {
    extends: 'nx/presets/npm.json',
    tasksRunnerOptions: {
      default: {
        runner: 'nx/tasks-runners/default',
        options: {
          cacheableOperations: ['build', 'test', 'lint']
        }
      }
    },
    targetDefaults: {
      build: {
        dependsOn: ['^build'],
        outputs: ['{projectRoot}/dist']
      },
      dev: {
        dependsOn: ['^build']
      }
    }
  };

  await fs.writeFile(
    path.join(rootPath, 'nx.json'),
    JSON.stringify(nxConfig, null, 2)
  );
}

async function generateTurborepoConfig(
  rootPath: string,
  config: ProjectConfig
): Promise<void> {
  const turboConfig = {
    $schema: 'https://turbo.build/schema.json',
    pipeline: {
      build: {
        dependsOn: ['^build'],
        outputs: ['dist/**']
      },
      dev: {
        cache: false,
        persistent: true
      },
      clean: {
        cache: false
      }
    }
  };

  await fs.writeFile(
    path.join(rootPath, 'turbo.json'),
    JSON.stringify(turboConfig, null, 2)
  );
}

async function generateHostInMonorepo(
  rootPath: string,
  config: ProjectConfig,
  remotes: RemoteReference[]
): Promise<void> {
  const originalCwd = process.cwd();
  const packagesPath = path.join(rootPath, 'packages');

  // Temporarily change directory context for generator
  process.chdir(packagesPath);
  
  try {
    await generateHostApp(config, remotes);
  } finally {
    process.chdir(originalCwd);
  }
}

async function generateRemoteInMonorepo(
  rootPath: string,
  config: ProjectConfig
): Promise<void> {
  const originalCwd = process.cwd();
  const packagesPath = path.join(rootPath, 'packages');

  // Temporarily change directory context for generator
  process.chdir(packagesPath);
  
  try {
    await generateRemoteApp(config);
  } finally {
    process.chdir(originalCwd);
  }
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
.turbo/
.nx/
`;
}

async function generateMonorepoReadme(
  rootPath: string,
  config: ProjectConfig
): Promise<void> {
  const readme = `# ${config.name}

Micro-frontend monorepo using ${config.monorepoTool} workspaces.

## Structure

\`\`\`
${config.name}/
├── packages/
│   ├── ${config.name}/          # ${config.type === 'host' ? 'Host application' : 'Remote application'}
${config.typescript ? '│   └── shared-types/    # Shared TypeScript types\n' : ''}├── package.json
${config.monorepoTool === 'pnpm' ? '└── pnpm-workspace.yaml\n' : config.monorepoTool === 'nx' ? '└── nx.json\n' : '└── turbo.json\n'}
\`\`\`

## Getting Started

### Installation

\`\`\`bash
${config.packageManager} install
\`\`\`

### Development

Run all applications in development mode:

\`\`\`bash
${config.packageManager} run dev
\`\`\`

### Build

Build all packages:

\`\`\`bash
${config.packageManager} run build
\`\`\`

## Adding New Packages

### Add a Host Application

\`\`\`bash
cd packages
npx create-micro-frontend --host
\`\`\`

### Add a Remote Application

\`\`\`bash
cd packages
npx create-micro-frontend --remote
\`\`\`

## Workspace Commands

${config.monorepoTool === 'pnpm' ? `
### pnpm Workspaces

- Install dependencies: \`pnpm install\`
- Add dependency to package: \`pnpm add <pkg> --filter <workspace>\`
- Run script in workspace: \`pnpm --filter <workspace> <script>\`
- Run script in all workspaces: \`pnpm -r <script>\`
- Run in parallel: \`pnpm --parallel -r <script>\`
` : config.monorepoTool === 'nx' ? `
### Nx Commands

- Run task: \`nx <target> <project>\`
- Run for all projects: \`nx run-many --target=<target> --all\`
- Show dependency graph: \`nx graph\`
- Cache management: \`nx reset\`
` : `
### Turborepo Commands

- Run task: \`turbo run <task>\`
- Run with cache: \`turbo run build --cache-dir=.turbo\`
- Force execution: \`turbo run build --force\`
- Clean cache: \`turbo clean\`
`}

## Package Dependencies

Packages can depend on each other. ${config.typescript ? 'The shared-types package is available to all applications:' : 'To share code:'}

\`\`\`json
{
  "dependencies": {
    ${config.typescript ? '"@micro-frontend/shared-types": "workspace:*"' : '"@internal/shared": "workspace:*"'}
  }
}
\`\`\`

## Best Practices

1. **Shared Dependencies**: Use workspace protocol for internal packages
2. **Type Safety**: Import shared types from the types package
3. **Versioning**: Keep shared dependencies in sync across packages
4. **Build Order**: The monorepo tool handles dependency-based build ordering
5. **Caching**: ${config.monorepoTool === 'nx' || config.monorepoTool === 'turborepo' ? 'Leverage built-in caching for faster builds' : 'Consider adding Nx or Turborepo for build caching'}

## Learn More

- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [${config.monorepoTool === 'pnpm' ? 'pnpm Workspaces' : config.monorepoTool === 'nx' ? 'Nx Documentation' : 'Turborepo Documentation'}](${
  config.monorepoTool === 'pnpm' 
    ? 'https://pnpm.io/workspaces' 
    : config.monorepoTool === 'nx' 
    ? 'https://nx.dev' 
    : 'https://turbo.build/repo/docs'
})
`;

  await fs.writeFile(path.join(rootPath, 'README.md'), readme);
}
