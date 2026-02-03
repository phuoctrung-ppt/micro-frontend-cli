# Usage Examples

## Quick Start

### Create a Simple Host Application

```bash
npx create-micro-frontend --host
```

Answer the prompts:
- **Project name**: `my-host`
- **Port**: `3000`
- **Framework**: `React`
- **TypeScript**: `Yes`
- **Monorepo**: `No`
- **Package manager**: `pnpm`

Result:
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

### Create a Simple Remote Application

```bash
npx create-micro-frontend --remote
```

Answer the prompts:
- **Project name**: `products-remote`
- **Port**: `3001`
- **Framework**: `React`
- **TypeScript**: `Yes`
- **Monorepo**: `No`
- **Package manager**: `pnpm`

Result:
```
products-remote/
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

### Run the Applications

```bash
# Terminal 1: Start the remote
cd products-remote
pnpm install
pnpm start

# Terminal 2: Start the host
cd my-host
pnpm install
pnpm start
```

## Monorepo Example

### Create a Full Micro-Frontend Monorepo

```bash
npx create-micro-frontend
```

Interactive mode:
- **Application type**: `Host`
- **Project name**: `ecommerce`
- **Port**: `3000`
- **Framework**: `React`
- **TypeScript**: `Yes`
- **Monorepo**: `Yes`
- **Monorepo tool**: `pnpm workspaces`
- **Package manager**: `pnpm`
- **Add remotes**: `No` (we'll add them next)

### Add Remotes to the Monorepo

```bash
cd ecommerce/packages
npx create-micro-frontend --remote
```

Configure first remote:
- **Project name**: `products`
- **Port**: `3001`
- **Framework**: `React`
- **TypeScript**: `Yes`
- **Monorepo**: `No` (it's already in a monorepo)
- **Package manager**: `pnpm`

```bash
cd ecommerce/packages
npx create-micro-frontend --remote
```

Configure second remote:
- **Project name**: `checkout`
- **Port**: `3002`
- **Framework**: `React`
- **TypeScript**: `Yes`
- **Monorepo**: `No`
- **Package manager**: `pnpm`

Final structure:
```
ecommerce/
├── packages/
│   ├── ecommerce/          # Host app
│   ├── products/           # Remote app
│   ├── checkout/           # Remote app
│   └── shared-types/       # Shared types
├── package.json
└── pnpm-workspace.yaml
```

### Update Host to Use Remotes

Edit `ecommerce/packages/ecommerce/webpack.config.js`:

```javascript
remotes: {
  products: 'products@http://localhost:3001/remoteEntry.js',
  checkout: 'checkout@http://localhost:3002/remoteEntry.js',
}
```

Edit `ecommerce/packages/ecommerce/src/App.tsx`:

```tsx
import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

const Products = React.lazy(() => import('products/App'));
const Checkout = React.lazy(() => import('checkout/App'));

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛍️ E-Commerce Platform</h1>
      
      <ErrorBoundary>
        <Suspense fallback={<div>Loading Products...</div>}>
          <Products />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense fallback={<div>Loading Checkout...</div>}>
          <Checkout />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
```

### Run the Monorepo

```bash
cd ecommerce
pnpm install
pnpm run dev
```

This starts all applications concurrently!

## Advanced Usage

### Using Shared Types

In `ecommerce/packages/shared-types/src/index.ts`:

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}
```

In remote app `ecommerce/packages/products/package.json`:

```json
{
  "dependencies": {
    "@micro-frontend/shared-types": "workspace:*"
  }
}
```

In `ecommerce/packages/products/src/App.tsx`:

```tsx
import { Product } from '@micro-frontend/shared-types';

const products: Product[] = [
  { id: '1', name: 'Widget', price: 29.99 },
  { id: '2', name: 'Gadget', price: 49.99 }
];
```

### Dynamic Remote Loading

Update host to load remotes dynamically:

```tsx
import React, { Suspense, useState } from 'react';

const App: React.FC = () => {
  const [showProducts, setShowProducts] = useState(false);
  
  const Products = React.lazy(() => import('products/App'));
  
  return (
    <div>
      <button onClick={() => setShowProducts(true)}>
        Load Products
      </button>
      
      {showProducts && (
        <Suspense fallback={<div>Loading...</div>}>
          <Products />
        </Suspense>
      )}
    </div>
  );
};
```

### Environment-Based Configuration

Create `.env.development`:
```env
PRODUCTS_URL=http://localhost:3001/remoteEntry.js
CHECKOUT_URL=http://localhost:3002/remoteEntry.js
```

Create `.env.production`:
```env
PRODUCTS_URL=https://products.example.com/remoteEntry.js
CHECKOUT_URL=https://checkout.example.com/remoteEntry.js
```

Update `webpack.config.js`:

```javascript
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      remotes: {
        products: `products@${process.env.PRODUCTS_URL}`,
        checkout: `checkout@${process.env.CHECKOUT_URL}`,
      }
    })
  ]
};
```

### Cross-Remote Communication

Use shared state management:

In `ecommerce/packages/shared-types/src/index.ts`:

```typescript
export interface AppEvents {
  'cart:add': { productId: string };
  'cart:remove': { productId: string };
}

export type EventCallback<T = any> = (data: T) => void;

export interface EventBus {
  on<K extends keyof AppEvents>(
    event: K, 
    callback: EventCallback<AppEvents[K]>
  ): void;
  emit<K extends keyof AppEvents>(
    event: K, 
    data: AppEvents[K]
  ): void;
}
```

Create event bus in host:

```tsx
// host/src/eventBus.ts
import { EventBus, EventCallback, AppEvents } from '@micro-frontend/shared-types';

class SimpleEventBus implements EventBus {
  private listeners = new Map<string, EventCallback[]>();

  on<K extends keyof AppEvents>(
    event: K, 
    callback: EventCallback<AppEvents[K]>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit<K extends keyof AppEvents>(
    event: K, 
    data: AppEvents[K]
  ): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}

export const eventBus = new SimpleEventBus();
```

Pass to remotes:

```tsx
// host/src/App.tsx
import { eventBus } from './eventBus';

const Products = React.lazy(() => import('products/App'));

<Products eventBus={eventBus} />
```

## Testing

### Unit Testing Remote Components

```tsx
// products/src/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

test('renders product name', () => {
  const product = { id: '1', name: 'Widget', price: 29.99 };
  render(<ProductCard product={product} />);
  expect(screen.getByText('Widget')).toBeInTheDocument();
});
```

### Integration Testing with Mock Remotes

```tsx
// host/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('products/App', () => ({
  default: () => <div>Mocked Products</div>
}));

test('loads remote products', () => {
  render(<App />);
  expect(screen.getByText('Mocked Products')).toBeInTheDocument();
});
```

## Deployment

### Build for Production

```bash
# Build all packages
cd ecommerce
pnpm run build
```

### Deploy Remotes First

```bash
# Deploy products remote
cd packages/products
aws s3 sync dist/ s3://products-bucket/
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"

# Deploy checkout remote
cd packages/checkout
aws s3 sync dist/ s3://checkout-bucket/
aws cloudfront create-invalidation --distribution-id YYY --paths "/*"
```

### Update Host Configuration

Update production URLs in host's `.env.production`:
```env
PRODUCTS_URL=https://d111111abcdef8.cloudfront.net/remoteEntry.js
CHECKOUT_URL=https://d222222abcdef8.cloudfront.net/remoteEntry.js
```

### Deploy Host

```bash
cd packages/ecommerce
pnpm run build
aws s3 sync dist/ s3://host-bucket/
aws cloudfront create-invalidation --distribution-id ZZZ --paths "/*"
```

## Troubleshooting

### Remote Not Loading

1. Check browser console for CORS errors
2. Verify remote is running: `curl http://localhost:3001/remoteEntry.js`
3. Check webpack config remotes configuration
4. Ensure shared dependencies match

### Type Errors

1. Rebuild shared types: `cd packages/shared-types && pnpm run build`
2. Clear node_modules: `pnpm clean && pnpm install`
3. Check tsconfig.json paths configuration

### Version Conflicts

Check React versions match:
```bash
pnpm list react
```

All packages should use the same version.

## Next Steps

- Add authentication across micro-frontends
- Implement shared routing
- Add monitoring and error tracking
- Set up CI/CD pipelines
- Implement feature flags
