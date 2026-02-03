# Changelog

All notable changes to the create-micro-frontend CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-03

### Added

#### Core Features
- ✨ CLI tool for creating micro-frontend applications
- ✨ `--host` flag for creating host (shell) applications
- ✨ `--remote` flag for creating remote micro-frontend modules
- ✨ Interactive mode when no flags provided
- ✨ Comprehensive prompts for project configuration

#### Framework Support
- ✨ React framework support with TypeScript and JavaScript
- ✨ Vue framework support with TypeScript and JavaScript
- ✨ Webpack 5 with Module Federation pre-configured

#### Monorepo Support
- ✨ pnpm workspaces integration
- ✨ Nx workspace configuration
- ✨ Turborepo configuration
- ✨ Automatic workspace setup and configuration
- ✨ Shared types package generation for TypeScript projects

#### Host Application Features
- ✨ Module Federation configuration with remote loading
- ✨ Error boundary components for graceful failure handling
- ✨ Suspense boundaries for loading states
- ✨ TypeScript type declarations for remote modules
- ✨ Environment configuration examples (.env.example)
- ✨ Sample remote integration
- ✨ Comprehensive README with usage instructions

#### Remote Application Features
- ✨ Async boundary pattern (bootstrap file) for proper initialization
- ✨ Module Federation configuration with exposes
- ✨ Sample Counter component demonstrating state management
- ✨ Type declarations for TypeScript projects
- ✨ Independent development server setup
- ✨ Integration guide in README

#### Configuration Management
- ✨ Automatic webpack.config.js generation
- ✨ Singleton shared dependency configuration
- ✨ Flexible version matching for shared dependencies
- ✨ Development server with hot module replacement
- ✨ Production-optimized build configuration
- ✨ TypeScript configuration with proper module resolution
- ✨ Babel configuration for React/Vue with TypeScript support

#### Type Safety
- ✨ Shared types package in monorepo setups
- ✨ Type declarations for remote modules
- ✨ Path mappings for remote imports
- ✨ Fork-ts-checker-webpack-plugin integration

#### Developer Experience
- ✨ Interactive prompts with inquirer
- ✨ Colored terminal output with chalk
- ✨ Loading spinners with ora
- ✨ Port number validation
- ✨ Project name validation
- ✨ Package manager selection (npm, yarn, pnpm)
- ✨ Next steps instructions after generation
- ✨ Comprehensive error messages

#### Documentation
- 📚 README.md with quick start guide
- 📚 DEVELOPMENT.md with architecture details
- 📚 BEST_PRACTICES.md with recommendations
- 📚 EXAMPLES.md with usage examples
- 📚 CONFIG_GUIDE.md with npm publishing guide

#### Best Practices
- ✨ Async boundaries for remote applications
- ✨ Error boundaries for host applications
- ✨ Singleton shared dependencies to prevent duplication
- ✨ Lazy loading with React.lazy() and Suspense
- ✨ Environment-based remote URLs
- ✨ Git-ready with .gitignore files
- ✨ TypeScript strict mode enabled

### Technical Details

#### Dependencies
- commander@^11.1.0 - CLI framework
- inquirer@^8.2.5 - Interactive prompts
- chalk@^4.1.2 - Terminal colors
- ora@^5.4.1 - Loading spinners
- fs-extra@^11.2.0 - File system operations
- typescript@^5.3.3 - TypeScript compiler

#### Generated Dependencies
- webpack@^5.89.0 - Module bundler
- @babel/core@^7.23.7 - JavaScript compiler
- react@^18.2.0 / vue@^3.4.0 - UI frameworks
- html-webpack-plugin@^5.6.0 - HTML generation

#### Architecture
- TypeScript-based CLI implementation
- Template-based code generation
- Modular command structure
- Configurable generators for different project types
- Utility functions for common operations

### Project Structure
```
create-micro-frontend/
├── src/
│   ├── commands/         # CLI command handlers
│   ├── config/          # Configuration generators
│   ├── generators/      # Project generators
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── index.ts         # CLI entry point
├── package.json
├── tsconfig.json
└── [documentation files]
```

### Generated Project Structures

#### Host Application
```
my-host/
├── src/
│   ├── components/
│   │   └── ErrorBoundary.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── remotes.d.ts
├── public/
│   └── index.html
├── webpack.config.js
├── package.json
├── tsconfig.json
└── README.md
```

#### Remote Application
```
my-remote/
├── src/
│   ├── components/
│   │   └── Counter.tsx
│   ├── App.tsx
│   ├── bootstrap.tsx
│   ├── index.ts
│   └── types.d.ts
├── public/
│   └── index.html
├── webpack.config.js
├── package.json
├── tsconfig.json
└── README.md
```

#### Monorepo
```
my-project/
├── packages/
│   ├── host/
│   ├── remote-app/
│   └── shared-types/
├── package.json
├── [workspace-config]
└── README.md
```

## [Unreleased]

### Planned Features
- [ ] Vue 3 Composition API examples
- [ ] CSS Modules support
- [ ] Styled Components configuration
- [ ] Jest testing setup
- [ ] React Testing Library configuration
- [ ] E2E testing with Playwright
- [ ] ESLint and Prettier configuration
- [ ] Husky pre-commit hooks
- [ ] GitHub Actions workflows
- [ ] Docker configuration
- [ ] Kubernetes manifests
- [ ] More framework support (Angular, Svelte)
- [ ] CSS framework integration (Tailwind, MUI)
- [ ] State management templates (Redux, Zustand, Pinia)
- [ ] Routing examples (React Router, Vue Router)
- [ ] Authentication patterns
- [ ] i18n setup
- [ ] PWA configuration
- [ ] Performance monitoring setup
- [ ] Error tracking (Sentry) integration

### Future Enhancements
- [ ] Upgrade command for existing projects
- [ ] Template customization
- [ ] Plugin system for extensions
- [ ] Interactive configuration wizard
- [ ] Project analytics and insights
- [ ] Dependency version management
- [ ] Automatic updates notification

## Version History

### Version 1.0.0 (Initial Release)
- First stable release
- Full Module Federation support
- React and Vue frameworks
- TypeScript support
- Monorepo support (pnpm, Nx, Turborepo)
- Comprehensive documentation

---

## Migration Guides

### From 0.x to 1.0.0
This is the initial stable release. No migration needed.

## Support

- 📖 [Documentation](./README.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/create-micro-frontend/issues)
- 💬 [Discussions](https://github.com/yourusername/create-micro-frontend/discussions)

## License

MIT License - see [LICENSE](./LICENSE) file for details.
