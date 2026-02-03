export function generateTsConfig(
  type: 'host' | 'remote',
  framework: 'react' | 'vue'
): Record<string, any> {
  const baseConfig: Record<string, any> = {
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'node',
      jsx: framework === 'react' ? 'react-jsx' : 'preserve',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      allowSyntheticDefaultImports: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  // Add paths for type resolution
  if (type === 'host') {
    baseConfig.compilerOptions.paths = {
      '*': ['src/@types/*']
    };
  }

  return baseConfig;
}
