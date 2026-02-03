# Create Micro Frontend CLI

A powerful CLI tool for scaffolding micro-frontend applications using Webpack Module Federation with production-ready best practices.

## ✨ Features

- 🚀 **Quick Scaffolding** - Host and remote apps in seconds
- 📦 **Module Federation** - Webpack 5 pre-configured
- 🔷 **TypeScript Support** - Full type safety with shared types
- 🎨 **Multi-Framework** - React and Vue support
- 🏗️ **Monorepo Ready** - Nx, Turborepo, pnpm workspaces
- ⚡ **Hot Reload** - Fast development experience
- 🔒 **Type-Safe Imports** - Auto-generated remote type declarations
- 🛡️ **Error Boundaries** - Graceful fallback handling
- 📝 **Comprehensive Docs** - Every project includes README
- 🎯 **Best Practices** - Production-ready configurations

## 🚀 Quick Start

### Create a Host Application

```bash
npx create-micro-frontend --host
```

### Create a Remote Application

```bash
npx create-micro-frontend --remote
```

### Interactive Mode

```bash
npx create-micro-frontend
```

See [QUICK_START.md](./QUICK_START.md) for a step-by-step guide.

## ⚠️ Important: Naming Requirements

Application names must be valid JavaScript identifiers for Module Federation to work:

- ✅ Use **camelCase**: `myRemoteApp`, `userService`, `productList`
- ✅ Use **underscores**: `my_remote_app`, `user_service`
- ❌ **Never use hyphens**: `my-remote-app` ← will cause webpack errors

The CLI automatically converts kebab-case names (with hyphens) to camelCase. See [BEST_PRACTICES.md](./BEST_PRACTICES.md) for details.

## What Gets Generated

### Host Application
- Pre-configured webpack with Module Federation
- Remote app integration setup
- Shared dependency configuration
- TypeScript declarations for remotes
- Development server setup

### Remote Application
- Module Federation plugin configured
- Component exports setup
- Shared dependencies
- Type generation for host consumption
- Independent dev server

### Monorepo Structure (optional)
```
my-micro-frontend/
├── packages/
│   ├── host/
│   ├── remote-app/
│   └── shared-types/
├── package.json
└── [nx.json|turbo.json|pnpm-workspace.yaml]
```

## Best Practices Included

1. **Dependency Sharing**: Singleton React/Vue instances to avoid duplication
2. **Type Safety**: Automatic type generation for cross-app imports
3. **Error Boundaries**: Graceful fallbacks for remote loading failures
4. **Version Management**: Semantic versioning for shared dependencies
5. **Development Workflow**: Concurrent dev servers with proper port management
6. **Code Splitting**: Optimized chunk loading strategies

## Example

```bash
# Create a new micro-frontend project
npx create-micro-frontend

# Follow the prompts:
# ? Select application type: Host
# ? Project name: main-app
# ? Port number: 3000
# ? Framework: React
# ? TypeScript: Yes
# ? Create as monorepo: Yes
# ? Monorepo tool: pnpm workspaces
```

## Requirements

- Node.js >= 16.0.0
- npm/yarn/pnpm

## License

MIT
