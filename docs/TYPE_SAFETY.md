# Type Safety in Micro-Frontends

## Overview

Type safety across micro-frontends is challenging because components are loaded dynamically at runtime. This guide covers three approaches with best practices.

## Approach 1: Manual Type Declarations (Quick Start)

**Use case**: Prototyping, simple setups, few remotes

### Host App: `src/remotes.d.ts`
```typescript
/// <reference types="react" />

declare module 'remoteApp/App' {
  const App: React.ComponentType<any>;
  export default App;
}

declare module 'remoteApp/*' {
  const component: React.ComponentType<any>;
  export default component;
}
```

### Usage
```typescript
// Type-checked import, but props are 'any'
const RemoteApp = React.lazy(() => import('remoteApp/App'));

<RemoteApp />  // No prop validation
```

**Pros:**
- ✅ Quick to set up
- ✅ No build configuration needed
- ✅ Works with any remote

**Cons:**
- ❌ No prop type checking
- ❌ Manual updates required
- ❌ No autocomplete

## Approach 2: Type Exports from Remote (Recommended)

**Use case**: Production apps, distributed teams, multiple remotes

### Remote App: Export Types

#### `remote-app/src/types.ts`
```typescript
export interface AppProps {
  userId?: string;
  theme?: 'light' | 'dark';
  onNavigate?: (path: string) => void;
}

export interface UserProfileProps {
  userId: string;
  showEmail?: boolean;
}
```

#### `remote-app/src/App.tsx`
```typescript
import React from 'react';
import type { AppProps } from './types';

const App: React.FC<AppProps> = ({ userId, theme, onNavigate }) => {
  // Implementation
};

export default App;
```

#### Expose types in webpack config
```javascript
// webpack.config.js
exposes: {
  './App': './src/App',
  './types': './src/types'  // ← Expose types
}
```

### Host App: Import Remote Types

#### `host-app/src/remotes.d.ts`
```typescript
/// <reference types="react" />

// Import actual types from remote
declare module 'remoteApp/types' {
  export interface AppProps {
    userId?: string;
    theme?: 'light' | 'dark';
    onNavigate?: (path: string) => void;
  }
}

declare module 'remoteApp/App' {
  import type { AppProps } from 'remoteApp/types';
  const App: React.ComponentType<AppProps>;
  export default App;
}
```

#### Usage with type safety
```typescript
import type { AppProps } from 'remoteApp/types';

const RemoteApp = React.lazy(() => import('remoteApp/App'));

// TypeScript validates props! ✅
<RemoteApp 
  userId="123" 
  theme="dark"
  onNavigate={(path) => console.log(path)}
/>

// TypeScript error: theme must be 'light' | 'dark' ❌
<RemoteApp theme="blue" />
```

**Pros:**
- ✅ Full type safety
- ✅ Autocomplete in IDE
- ✅ Compile-time error checking
- ✅ Self-documenting APIs

**Cons:**
- ⚠️ Requires type synchronization
- ⚠️ Remote must expose types
- ⚠️ Version compatibility concerns

## Approach 3: Shared Types Package (Monorepo)

**Use case**: Monorepo setups (pnpm, Nx, Turborepo), tightly coupled apps

### Structure
```
monorepo/
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components.ts
│   │   │   └── events.ts
│   │   └── package.json
│   ├── host-app/
│   │   └── package.json → depends on @myapp/shared-types
│   └── remote-app/
│       └── package.json → depends on @myapp/shared-types
```

### Shared Types Package

#### `packages/shared-types/src/components.ts`
```typescript
export interface RemoteAppProps {
  userId?: string;
  theme?: 'light' | 'dark';
  onNavigate?: (path: string) => void;
}

export interface UserProfileProps {
  userId: string;
  showEmail?: boolean;
}
```

#### `packages/shared-types/src/events.ts`
```typescript
export interface NavigationEvent {
  type: 'navigate';
  path: string;
  timestamp: number;
}

export interface UserEvent {
  type: 'user-update';
  userId: string;
  data: unknown;
}

export type MicroFrontendEvent = NavigationEvent | UserEvent;
```

### Remote App: Use Shared Types

```typescript
import React from 'react';
import type { RemoteAppProps } from '@myapp/shared-types';

const App: React.FC<RemoteAppProps> = ({ userId, theme, onNavigate }) => {
  // Implementation
};

export default App;
```

### Host App: Use Shared Types

#### `host-app/src/remotes.d.ts`
```typescript
/// <reference types="react" />

declare module 'remoteApp/App' {
  import type { RemoteAppProps } from '@myapp/shared-types';
  const App: React.ComponentType<RemoteAppProps>;
  export default App;
}
```

#### Usage
```typescript
import type { RemoteAppProps } from '@myapp/shared-types';

const RemoteApp = React.lazy(() => import('remoteApp/App'));

const props: RemoteAppProps = {
  userId: "123",
  theme: "dark",
  onNavigate: (path) => console.log(path)
};

<RemoteApp {...props} />  // Fully type-safe! ✅
```

**Pros:**
- ✅ Single source of truth
- ✅ Easy to update types
- ✅ Works across all packages
- ✅ Type versioning possible

**Cons:**
- ⚠️ Requires monorepo
- ⚠️ Tight coupling between apps
- ⚠️ All apps must update together

## Comparison Matrix

| Feature | Manual Declarations | Type Exports | Shared Package |
|---------|-------------------|--------------|----------------|
| Type Safety | ❌ None | ✅ Full | ✅ Full |
| Setup Complexity | ✅ Low | ⚠️ Medium | ⚠️ Medium |
| Maintenance | ❌ High | ⚠️ Medium | ✅ Low |
| Independent Deploy | ✅ Yes | ✅ Yes | ❌ No |
| Monorepo Required | ❌ No | ❌ No | ✅ Yes |
| Autocomplete | ❌ No | ✅ Yes | ✅ Yes |
| Runtime Safety | ❌ No | ❌ No | ❌ No |

## Best Practices

### 1. Start Simple, Evolve as Needed
```
Prototype → Manual Declarations
Production → Type Exports
Monorepo → Shared Package
```

### 2. Version Your Types

For distributed apps using Type Exports:

```typescript
// remote-app/src/types.ts
export const TYPE_VERSION = '1.0.0';

export interface AppPropsV1 {
  userId?: string;
}

// When breaking changes needed
export interface AppPropsV2 {
  user: { id: string; name: string };  // Breaking change
}
```

### 3. Document Expected Props

```typescript
/**
 * Props for the RemoteApp component.
 * 
 * @example
 * ```tsx
 * <RemoteApp userId="123" theme="dark" />
 * ```
 * 
 * @see {@link https://docs.example.com/remote-app}
 */
export interface RemoteAppProps {
  /** User ID to display profile for */
  userId?: string;
  
  /** UI theme preference */
  theme?: 'light' | 'dark';
  
  /** Called when user navigates */
  onNavigate?: (path: string) => void;
}
```

### 4. Runtime Validation

TypeScript types are erased at runtime. Add runtime checks:

```typescript
import React from 'react';
import type { RemoteAppProps } from './types';

const App: React.FC<RemoteAppProps> = (props) => {
  // Runtime validation
  if (props.theme && !['light', 'dark'].includes(props.theme)) {
    console.error(`Invalid theme: ${props.theme}`);
    return <div>Error: Invalid theme</div>;
  }
  
  // Implementation
};
```

### 5. Use Type Guards

```typescript
// shared-types/src/guards.ts
import type { MicroFrontendEvent, NavigationEvent } from './events';

export function isNavigationEvent(
  event: MicroFrontendEvent
): event is NavigationEvent {
  return event.type === 'navigate';
}

// Usage
if (isNavigationEvent(event)) {
  console.log(event.path);  // TypeScript knows this exists
}
```

## Automated Tools

### @module-federation/typescript

Automatically generates types from remotes:

```bash
npm install --save-dev @module-federation/typescript
```

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;
const { FederatedTypesPlugin } = require('@module-federation/typescript');

new ModuleFederationPlugin({
  // ... your config
}),
new FederatedTypesPlugin({
  federationConfig: {
    // ... your Module Federation config
  }
})
```

Benefits:
- ✅ Auto-generates `.d.ts` files
- ✅ Updates on remote changes
- ✅ Works with build tools

## Recommendation

**Choose based on your setup:**

1. **Standalone apps** → Type Exports (Approach 2)
2. **Monorepo** → Shared Types Package (Approach 3)
3. **Prototype/MVP** → Manual Declarations (Approach 1)
4. **Large scale** → @module-federation/typescript

## CLI Support

The CLI generates:

### For Host Apps
- `src/remotes.d.ts` with type declarations
- Documentation on updating types
- Examples in README

### For Remote Apps  
- `src/types.ts` with exportable interfaces
- Comments on exposing types
- Best practices guide

Update these files as your components evolve!
