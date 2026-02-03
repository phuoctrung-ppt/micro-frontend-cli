# Development Guide

## Project Structure

```
create-micro-frontend/
├── src/
│   ├── commands/           # CLI command handlers
│   │   ├── create-host.ts
│   │   ├── create-remote.ts
│   │   └── interactive.ts
│   ├── config/            # Configuration generators
│   │   └── federation-config.ts
│   ├── generators/        # Project generators
│   │   ├── host-generator.ts
│   │   ├── remote-generator.ts
│   │   ├── monorepo-generator.ts
│   │   └── type-generator.ts
│   ├── utils/            # Utility functions
│   │   ├── prompts.ts
│   │   ├── package-generator.ts
│   │   ├── tsconfig-generator.ts
│   │   └── helpers.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   └── index.ts          # CLI entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Testing Locally

Link the CLI globally:

```bash
npm link
```

Then test it:

```bash
create-micro-frontend --host
```

Unlink when done:

```bash
npm unlink -g create-micro-frontend
```

## Key Features

### 1. Module Federation Configuration

The CLI generates optimized webpack configs with:
- Singleton shared dependencies
- Proper async boundaries
- Type-safe remote imports
- Error boundaries

### 2. Monorepo Support

Three options:
- **pnpm workspaces**: Lightweight, fast
- **Nx**: Advanced caching, task orchestration
- **Turborepo**: Incremental builds, remote caching

### 3. Type Safety

TypeScript support includes:
- Shared types package in monorepo
- Type declarations for remote modules
- Auto-generated type definitions
- Path mappings for imports

### 4. Best Practices

Built-in best practices:
- Async boundaries with bootstrap files
- Error boundaries for graceful fallbacks
- Singleton dependencies to prevent duplication
- Environment-based remote URLs
- Git-ready with .gitignore

## Architecture Decisions

### Why Bootstrap Files?

Remote applications use a bootstrap pattern:
```
index.js → import('./bootstrap.js')
```

This ensures Module Federation has time to resolve shared dependencies before the application starts.

### Shared Dependencies Strategy

Default configuration:
```javascript
{
  singleton: true,      // Only one version loaded
  requiredVersion: '^18.0.0',
  strictVersion: false, // Allow version mismatch
  eager: false         // Lazy load
}
```

### Error Handling

Host apps include error boundaries to gracefully handle:
- Remote loading failures
- Network issues
- Version mismatches
- Runtime errors

## Extending the CLI

### Adding New Framework

1. Update `ProjectConfig` type in [src/types/index.ts](src/types/index.ts)
2. Add framework dependencies in [src/utils/package-generator.ts](src/utils/package-generator.ts)
3. Create generator functions in host/remote generators
4. Update shared dependencies in [src/config/federation-config.ts](src/config/federation-config.ts)

### Adding New Monorepo Tool

1. Update prompts in [src/utils/prompts.ts](src/utils/prompts.ts)
2. Add configuration generator in [src/generators/monorepo-generator.ts](src/generators/monorepo-generator.ts)
3. Update package.json scripts

### Adding New Commands

1. Create command file in `src/commands/`
2. Register in [src/index.ts](src/index.ts)
3. Update README with usage

## Publishing

1. Build the project:
   ```bash
   npm run build
   ```

2. Test locally with npm link

3. Update version in package.json

4. Publish:
   ```bash
   npm publish
   ```

## Troubleshooting

### Module Federation Issues

- Ensure remoteEntry.js is accessible
- Check CORS headers on remote servers
- Verify shared dependency versions match

### TypeScript Errors

- Run `npm run build` to check for type errors
- Ensure all imports are typed correctly
- Check tsconfig.json paths configuration

### Monorepo Issues

- Clear node_modules and reinstall
- Check workspace configuration files
- Verify package.json names are unique

## Resources

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Micro-Frontend Architecture](https://micro-frontends.org/)
- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)
