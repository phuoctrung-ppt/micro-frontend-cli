# Quick Start Guide

Get your micro-frontend project up and running in 5 minutes!

## Installation

No installation required! Use npx to run directly:

```bash
npx create-micro-frontend
```

Or link locally for development:
```bash
npm link
create-micro-frontend
```

## Your First Micro-Frontend

### Step 1: Create a Remote Application

```bash
npx create-micro-frontend --remote
```

**Answer the prompts:**
- Project name: `products`
- Port: `3001`
- Framework: `React`
- TypeScript: `Yes`
- Monorepo: `No`
- Package manager: `pnpm`

**Start the remote:**
```bash
cd products
pnpm install
pnpm start
```

Visit http://localhost:3001 to see your remote running independently!

### Step 2: Create a Host Application

Open a new terminal:

```bash
npx create-micro-frontend --host
```

**Answer the prompts:**
- Project name: `main-app`
- Port: `3000`
- Framework: `React`
- TypeScript: `Yes`
- Monorepo: `No`
- Package manager: `pnpm`
- Add remotes now: `Yes`
  - Remote name: `products`
  - Remote URL: `http://localhost:3001/remoteEntry.js`

**Start the host:**
```bash
cd main-app
pnpm install
pnpm start
```

Visit http://localhost:3000 to see your host loading the remote!

### Step 3: Verify Integration

Your host application at http://localhost:3000 should now display:
- The host application header
- The remote "products" component loaded dynamically
- A counter component from the remote

🎉 **Congratulations!** You've created your first micro-frontend architecture!

## What Just Happened?

### Architecture Created

```
┌─────────────────────────────────────┐
│         Host (main-app)             │
│         Port: 3000                  │
│  ┌───────────────────────────────┐  │
│  │  Loads Remote Module          │  │
│  │  via Module Federation        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↓
        remoteEntry.js
                 ↓
┌─────────────────────────────────────┐
│      Remote (products)              │
│      Port: 3001                     │
│  ┌───────────────────────────────┐  │
│  │  Exposes: ./App                │  │
│  │  Can run independently         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Key Features

✅ **Independent Development** - Each app runs separately  
✅ **Shared Dependencies** - React shared as singleton  
✅ **Type Safety** - TypeScript types for cross-app imports  
✅ **Error Handling** - Graceful fallbacks if remote fails  
✅ **Hot Reload** - Changes reflect immediately  

## Next Steps

### Add More Remotes

Create another remote:
```bash
npx create-micro-frontend --remote
# Name: checkout, Port: 3002
```

Update `main-app/webpack.config.js`:
```javascript
remotes: {
  products: 'products@http://localhost:3001/remoteEntry.js',
  checkout: 'checkout@http://localhost:3002/remoteEntry.js',
}
```

Use in `main-app/src/App.tsx`:
```tsx
const Products = React.lazy(() => import('products/App'));
const Checkout = React.lazy(() => import('checkout/App'));

<ErrorBoundary>
  <Suspense fallback={<div>Loading...</div>}>
    <Products />
    <Checkout />
  </Suspense>
</ErrorBoundary>
```

### Create a Monorepo

For larger projects, use monorepo mode:

```bash
npx create-micro-frontend
```

Choose:
- Application type: `Host`
- Project name: `my-platform`
- Create as monorepo: `Yes`
- Monorepo tool: `pnpm workspaces`

This creates:
```
my-platform/
├── packages/
│   ├── my-platform/     # Host
│   └── shared-types/    # Shared types
├── package.json
└── pnpm-workspace.yaml
```

Add remotes in `packages/`:
```bash
cd my-platform/packages
npx create-micro-frontend --remote
```

Run all together:
```bash
cd my-platform
pnpm install
pnpm run dev  # Starts all apps!
```

### Customize Your Apps

#### Add Shared Types

In monorepo, edit `packages/shared-types/src/index.ts`:
```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
}
```

Use in remote:
```typescript
import { Product } from '@micro-frontend/shared-types';

const products: Product[] = [
  { id: '1', name: 'Widget', price: 29.99 }
];
```

#### Add Routing

Install React Router:
```bash
cd main-app
pnpm add react-router-dom
```

Update App.tsx:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Products = React.lazy(() => import('products/App'));
const Checkout = React.lazy(() => import('checkout/App'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={
          <Suspense fallback={<div>Loading...</div>}>
            <Products />
          </Suspense>
        } />
        <Route path="/checkout" element={
          <Suspense fallback={<div>Loading...</div>}>
            <Checkout />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

#### Add State Management

For shared state, use context or a state library:

```bash
pnpm add zustand
```

Create store in shared-types or host:
```typescript
import create from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
}));
```

Pass to remotes via props:
```tsx
<Products store={useCartStore} />
```

### Build for Production

```bash
# Build all apps
cd products
pnpm run build

cd ../main-app
pnpm run build
```

Deploy each app independently!

## Common Tasks

### Change Port

Edit `webpack.config.js`:
```javascript
devServer: {
  port: 3005,  // Your new port
}
```

### Add New Exposed Module

In remote's `webpack.config.js`:
```javascript
exposes: {
  './App': './src/App',
  './ProductList': './src/components/ProductList',  // New!
}
```

Use in host:
```tsx
const ProductList = React.lazy(() => import('products/ProductList'));
```

### Handle Remote Failure

Use error boundaries (already included!):
```tsx
<ErrorBoundary fallback={<div>Products unavailable</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <Products />
  </Suspense>
</ErrorBoundary>
```

### Debug Issues

1. **Remote not loading?**
   - Check if remote is running: `curl http://localhost:3001/remoteEntry.js`
   - Check browser console for errors
   - Verify webpack config remotes URL

2. **Type errors?**
   - Rebuild shared types: `cd packages/shared-types && pnpm run build`
   - Restart TypeScript server in your editor

3. **Version conflicts?**
   - Check React versions match: `pnpm list react`
   - Ensure all packages use same version

## Help & Resources

- 📖 **[Full Documentation](./README.md)**
- 🎓 **[Examples](./EXAMPLES.md)**
- ✨ **[Best Practices](./BEST_PRACTICES.md)**
- 🔧 **[Development Guide](./DEVELOPMENT.md)**

## Need Help?

Common questions:

**Q: Can I use different frameworks in host vs remote?**  
A: Yes! But they can't share components directly. Each needs its own framework runtime.

**Q: How do I share authentication?**  
A: Pass auth state via props, or use a shared context/store.

**Q: Can remotes communicate with each other?**  
A: Yes, through the host using an event bus or shared state.

**Q: How do I deploy this?**  
A: Deploy each app separately to different URLs. Update host config with production URLs.

**Q: What about CSS conflicts?**  
A: Use CSS Modules, Styled Components, or BEM naming. Each remote has isolated styles.

## Success! 🎉

You now have:
- ✅ Working micro-frontend architecture
- ✅ Independent deployable apps
- ✅ Type-safe cross-app imports
- ✅ Development environment ready
- ✅ Production build capability

Start building your distributed application!
