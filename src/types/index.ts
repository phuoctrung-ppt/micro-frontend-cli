export interface ProjectConfig {
  type: 'host' | 'remote';
  name: string;
  port: number;
  framework: 'react' | 'vue';
  typescript: boolean;
  isMonorepo: boolean;
  monorepoTool?: 'nx' | 'turborepo' | 'pnpm';
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface HostConfig extends ProjectConfig {
  type: 'host';
  remotes: RemoteReference[];
}

export interface RemoteConfig extends ProjectConfig {
  type: 'remote';
  exposes: Record<string, string>;
}

export interface RemoteReference {
  name: string;
  url: string;
}

export interface MonorepoConfig {
  tool: 'nx' | 'turborepo' | 'pnpm';
  packages: string[];
  rootPath: string;
}

export interface SharedDependency {
  singleton?: boolean;
  strictVersion?: boolean;
  requiredVersion?: string;
  eager?: boolean;
}

export interface ModuleFederationConfig {
  name: string;
  filename?: string;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, SharedDependency | string>;
}
