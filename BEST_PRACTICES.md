# Best Practices for Micro-Frontend CLI

## Naming Conventions

### Application Names

**IMPORTANT**: Module Federation requires application names to be valid JavaScript identifiers.

```bash
# ✅ Good: Valid JavaScript identifiers
npx create-micro-frontend --remote --name myRemoteApp
npx create-micro-frontend --host --name hostApp
npx create-micro-frontend --remote --name user_service

# ❌ Bad: Invalid identifiers (contain hyphens)
npx create-micro-frontend --remote --name my-remote-app  # Will cause webpack error
npx create-micro-frontend --host --name host-app         # Not a valid JS identifier
```

**Rules:**
- Use **camelCase** (recommended): `userService`, `remoteApp`, `productList`
- Use **underscores** (alternative): `user_service`, `remote_app`, `product_list`
- **Never use hyphens**: `-` is not valid in JavaScript identifiers
- Start with a letter (not a number or symbol)
- Avoid reserved JavaScript keywords: `class`, `function`, `return`, etc.

**Note**: The CLI automatically sanitizes names by converting kebab-case to camelCase. If you enter `my-app-name`, it will be converted to `myAppName` in the configuration.

## Architecture Best Practices

### 1. Module Federation Configuration

#### Shared Dependencies
```javascript
// ✅ Good: Singleton with flexible versioning
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.0.0',
    strictVersion: false,  // Allow minor version differences
    eager: false           // Lazy load for better performance
  }
}

// ❌ Bad: Strict versioning causes conflicts
shared: {
  react: {
    singleton: true,
    strictVersion: true,  // May break with version mismatches
    eager: true           // Loads immediately, larger bundle
  }
}
```

#### Remote Loading
```typescript
// ✅ Good: Lazy loading with error boundary
const RemoteApp = React.lazy(() => import('remote/App'));

<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<Loading />}>
    <RemoteApp />
  </Suspense>
</ErrorBoundary>

// ❌ Bad: Synchronous import, no error handling
import RemoteApp from 'remote/App';  // Will fail at build time
<RemoteApp />
```

### 2. Type Safety

#### Shared Types Package
```typescript
// ✅ Good: Centralized types in monorepo
// packages/shared-types/src/index.ts
export interface UserData {
  id: string;
  name: string;
}

// packages/remote/src/App.tsx
import { UserData } from '@micro-frontend/shared-types';

// ❌ Bad: Duplicated types across packages
// Each package defines its own UserData interface
```

#### Type Declarations for Remotes
```typescript
// ✅ Good: Type definitions for remote modules
// src/remotes.d.ts
declare module 'remote/App' {
  const App: React.ComponentType<{ userId: string }>;
  export default App;
}

// Usage is now type-safe
const RemoteApp = React.lazy(() => import('remote/App'));
<RemoteApp userId="123" />  // TypeScript validates props

// ❌ Bad: No type definitions
// import('remote/App') returns any
```

### 3. Project Structure

#### Monorepo Organization
```
✅ Good: Clear separation of concerns
my-micro-frontend/
├── packages/
│   ├── host/              # Shell application
│   ├── remote-products/   # Product catalog remote
│   ├── remote-checkout/   # Checkout remote
│   └── shared-types/      # Shared TypeScript types
├── package.json
└── pnpm-workspace.yaml

❌ Bad: Flat structure without clear boundaries
my-app/
├── host-and-remote-mixed/
├── shared-stuff/
└── utils/
```

#### Remote Structure
```
✅ Good: Async boundary pattern
remote-app/
├── src/
│   ├── index.ts           # import('./bootstrap')
│   ├── bootstrap.tsx      # Actual app initialization
│   └── App.tsx

❌ Bad: Direct initialization
remote-app/
├── src/
│   └── index.tsx          # ReactDOM.render() immediately
```

### 4. Development Workflow

#### Port Management
```javascript
// ✅ Good: Consistent port allocation
// .env
HOST_PORT=3000
REMOTE_PRODUCTS_PORT=3001
REMOTE_CHECKOUT_PORT=3002

// ❌ Bad: Hardcoded random ports
const PORT = 8734;  // Why this number?
```

#### Environment Configuration
```javascript
// ✅ Good: Environment-based remote URLs
const remotes = {
  products: process.env.NODE_ENV === 'production'
    ? 'products@https://products.example.com/remoteEntry.js'
    : 'products@http://localhost:3001/remoteEntry.js'
}

// ❌ Bad: Hardcoded URLs
const remotes = {
  products: 'products@http://localhost:3001/remoteEntry.js'
}
```

### 5. Error Handling

#### Error Boundaries
```typescript
// ✅ Good: Specific error boundaries for remotes
<ErrorBoundary 
  fallback={<RemoteErrorFallback remoteName="products" />}
  onError={logRemoteError}
>
  <Suspense fallback={<RemoteLoading />}>
    <RemoteProducts />
  </Suspense>
</ErrorBoundary>

// ❌ Bad: Generic error handling
try {
  const Remote = await import('remote/App');
} catch (e) {
  console.error(e);  // User sees nothing
}
```

#### Loading States
```typescript
// ✅ Good: Specific loading states
<Suspense fallback={
  <div>
    <Spinner />
    <p>Loading Products Module...</p>
  </div>
}>
  <RemoteProducts />
</Suspense>

// ❌ Bad: Generic or no loading state
<Suspense fallback="Loading...">
  <RemoteProducts />
</Suspense>
```

### 6. Dependency Management

#### Version Alignment
```json
// ✅ Good: Aligned versions across packages
{
  "dependencies": {
    "react": "^18.2.0",      // Same across all packages
    "react-dom": "^18.2.0"
  }
}

// ❌ Bad: Mismatched versions
// host: react@18.2.0
// remote: react@17.0.2  // Will cause issues!
```

#### Shared Module Strategy
```javascript
// ✅ Good: Share framework, not utilities
shared: {
  react: { singleton: true },
  'react-dom': { singleton: true },
  // Don't share: lodash, date-fns, etc.
}

// ❌ Bad: Over-sharing
shared: {
  react: { singleton: true },
  lodash: { singleton: true },     // Each remote can use different version
  'date-fns': { singleton: true },  // Unnecessary constraint
  axios: { singleton: true }        // Each remote should manage its own
}
```

### 7. Build and Deployment

#### Build Pipeline
```bash
# ✅ Good: Build order respects dependencies
1. Build shared types
2. Build remotes (can be parallel)
3. Build host (depends on types)

# ❌ Bad: Random build order
Build everything simultaneously without dependency checks
```

#### Deployment Strategy
```
✅ Good: Independent deployment
- Each remote deployed separately
- Host references remote URLs
- Rolling updates possible

❌ Bad: Monolithic deployment
- All apps deployed together
- Defeats micro-frontend purpose
```

### 8. Testing Strategy

#### Integration Testing
```typescript
// ✅ Good: Test with mock remotes
test('loads remote successfully', async () => {
  mockRemote('products/App', MockProductsApp);
  render(<Host />);
  await waitFor(() => 
    expect(screen.getByText('Products')).toBeInTheDocument()
  );
});

// ❌ Bad: Testing against live remotes
test('loads remote', () => {
  render(<Host />);  // Fails if remote is down
});
```

#### E2E Testing
```typescript
// ✅ Good: Test integrated system
test('user can browse products and checkout', async () => {
  // Start all services
  await startHost();
  await startRemote('products');
  await startRemote('checkout');
  
  // Test full flow
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="product-1"]');
  await page.click('[data-testid="add-to-cart"]');
  // ...
});
```

## CLI Design Best Practices

### 1. User Experience
- ✅ Interactive prompts with sensible defaults
- ✅ Clear progress indicators
- ✅ Helpful error messages
- ✅ Generated README with next steps

### 2. Generated Code Quality
- ✅ Follow framework conventions
- ✅ Include comments explaining Module Federation
- ✅ Add example components
- ✅ Pre-configured linting and formatting

### 3. Flexibility
- ✅ Support multiple frameworks (React, Vue)
- ✅ Support multiple package managers
- ✅ Support multiple monorepo tools
- ✅ Allow customization via config files

### 4. Maintainability
- ✅ Template-based generation
- ✅ Versioned dependencies
- ✅ Upgrade path for generated projects
- ✅ Clear documentation

## Summary

The key to successful micro-frontends is:
1. **Independence**: Each app can be developed, deployed independently
2. **Type Safety**: Shared types prevent runtime errors
3. **Error Resilience**: Graceful degradation when remotes fail
4. **Version Management**: Careful shared dependency configuration
5. **Developer Experience**: Fast dev loops, clear errors, good tooling
