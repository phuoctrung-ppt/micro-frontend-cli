export interface MicroFrontendConfig {
  name: string;
  type: 'host' | 'remote';
  port: number;
  framework: 'react' | 'vue';
  
  // Remote-specific config
  exposes?: Record<string, string>;
  
  // Host-specific config
  remotes?: Array<{
    name: string;
    url: string;
    entry?: string;
  }>;
  
  // Shared config
  shared?: Record<string, {
    singleton?: boolean;
    strictVersion?: boolean;
    requiredVersion?: string;
    eager?: boolean;
  }>;
  
  // Build config
  build?: {
    outputPath?: string;
    publicPath?: string;
  };
  
  // Dev server config
  devServer?: {
    hot?: boolean;
    historyApiFallback?: boolean;
    cors?: boolean;
  };
}
