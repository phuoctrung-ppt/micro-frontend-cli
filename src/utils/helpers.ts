import * as fs from 'fs-extra';

/**
 * Check if directory is empty
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath);
    return files.length === 0;
  } catch {
    return true;
  }
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): { valid: boolean; message?: string } {
  if (!name) {
    return { valid: false, message: 'Project name is required' };
  }

  if (!/^[a-z0-9-_]+$/.test(name)) {
    return {
      valid: false,
      message: 'Project name must contain only lowercase letters, numbers, hyphens, and underscores'
    };
  }

  if (name.startsWith('-') || name.startsWith('_')) {
    return {
      valid: false,
      message: 'Project name cannot start with a hyphen or underscore'
    };
  }

  return { valid: true };
}

/**
 * Convert kebab-case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Convert kebab-case to PascalCase
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Get available port
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get package manager command
 */
export function getPackageManagerCommand(
  manager: 'npm' | 'yarn' | 'pnpm',
  command: string
): string {
  const commands: Record<string, Record<string, string>> = {
    npm: {
      install: 'npm install',
      add: 'npm install',
      run: 'npm run',
      exec: 'npx'
    },
    yarn: {
      install: 'yarn',
      add: 'yarn add',
      run: 'yarn',
      exec: 'yarn'
    },
    pnpm: {
      install: 'pnpm install',
      add: 'pnpm add',
      run: 'pnpm',
      exec: 'pnpm exec'
    }
  };

  return commands[manager][command] || command;
}
