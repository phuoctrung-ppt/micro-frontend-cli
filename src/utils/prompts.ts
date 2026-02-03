import inquirer from 'inquirer';
import { ProjectConfig } from '../types';

export async function promptProjectDetails(defaultType?: 'host' | 'remote'): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select application type:',
      choices: [
        { name: 'Host (Shell/Container app)', value: 'host' },
        { name: 'Remote (Micro-frontend module)', value: 'remote' }
      ],
      when: !defaultType,
      default: 'host'
    },
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: (answers: any) => {
        const type = defaultType || answers.type;
        return type === 'host' ? 'host-app' : 'remote-app';
      },
      validate: (input: string) => {
        if (!input) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/.test(input)) {
          return 'Project name must contain only lowercase letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'number',
      name: 'port',
      message: 'Port number:',
      default: (answers: any) => {
        const type = defaultType || answers.type;
        return type === 'host' ? 3000 : 3001;
      },
      validate: (input: number) => {
        if (input < 1024 || input > 65535) {
          return 'Port must be between 1024 and 65535';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Select framework:',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' }
      ],
      default: 'react'
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: true
    },
    {
      type: 'confirm',
      name: 'isMonorepo',
      message: 'Create as monorepo?',
      default: false
    },
    {
      type: 'list',
      name: 'monorepoTool',
      message: 'Select monorepo tool:',
      choices: [
        { name: 'pnpm workspaces (Recommended)', value: 'pnpm' },
        { name: 'Nx', value: 'nx' },
        { name: 'Turborepo', value: 'turborepo' }
      ],
      when: (answers: any) => answers.isMonorepo,
      default: 'pnpm'
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Select package manager:',
      choices: [
        { name: 'pnpm (Recommended)', value: 'pnpm' },
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' }
      ],
      default: 'pnpm'
    }
  ]);

  return {
    type: defaultType || answers.type,
    name: answers.name,
    port: answers.port,
    framework: answers.framework,
    typescript: answers.typescript,
    isMonorepo: answers.isMonorepo,
    monorepoTool: answers.monorepoTool,
    packageManager: answers.packageManager
  };
}

export async function promptRemoteDetails(): Promise<{ name: string; url: string }[]> {
  const { addRemotes } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addRemotes',
      message: 'Do you want to add remote applications now?',
      default: false
    }
  ]);

  if (!addRemotes) {
    return [];
  }

  const remotes: { name: string; url: string }[] = [];
  let addMore = true;

  while (addMore) {
    const remote = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Remote application name:',
        validate: (input: string) => {
          if (!input) return 'Remote name is required';
          if (!/^[a-zA-Z0-9_]+$/.test(input)) {
            return 'Remote name must contain only letters, numbers, and underscores';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'url',
        message: 'Remote URL (e.g., http://localhost:3001/remoteEntry.js):',
        default: (answers: any) => `http://localhost:3001/remoteEntry.js`,
        validate: (input: string) => {
          if (!input) return 'URL is required';
          return true;
        }
      }
    ]);

    remotes.push(remote);

    const { more } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'more',
        message: 'Add another remote?',
        default: false
      }
    ]);

    addMore = more;
  }

  return remotes;
}
