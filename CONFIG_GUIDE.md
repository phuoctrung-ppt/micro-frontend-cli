# Configuration File Guide

## micro-frontend.config.json

The `micro-frontend.config.json` file is the central configuration for your micro-frontend application. Webpack reads this file to determine how to configure Module Federation.

## Benefits

- ✅ **Single Source of Truth** - All configuration in one place
- ✅ **Easy to Modify** - No need to edit webpack config
- ✅ **Type-Safe** - JSON schema validation
- ✅ **Environment-Friendly** - Easy to override per environment
- ✅ **Clear Structure** - Self-documenting configuration

## Configuration Schema

### Host Application Example

```json
{
  "name": "main-app",
  "type": "host",
  "port": 3000,
  "framework": "react",
  "remotes": [
    {
      "name": "products",
      "url": "http://localhost:3001/remoteEntry.js",
      "entry": "remoteEntry.js"
    },
    {
      "name": "checkout",
      "url": "http://localhost:3002/remoteEntry.js",
      "entry": "remoteEntry.js"
    }
  ],
  "shared": {
    "react": {
      "singleton": true,
      "requiredVersion": "^18.0.0",
      "strictVersion": false,
      "eager": false
    },
    "react-dom": {
      "singleton": true,
      "requiredVersion": "^18.0.0",
      "strictVersion": false,
      "eager": false
    }
  },
  "build": {
    "outputPath": "dist",
    "publicPath": "auto"
  },
  "devServer": {
    "hot": true,
    "historyApiFallback": true,
    "cors": true
  }
}
```

### Remote Application Example

```json
{
  "name": "products",
  "type": "remote",
  "port": 3001,
  "framework": "react",
  "exposes": {
    "./App": "./src/App",
    "./ProductList": "./src/components/ProductList",
    "./ProductDetail": "./src/components/ProductDetail"
  },
  "shared": {
    "react": {
      "singleton": true,
      "requiredVersion": "^18.0.0",
      "strictVersion": false,
      "eager": false
    },
    "react-dom": {
      "singleton": true,
      "requiredVersion": "^18.0.0",
      "strictVersion": false,
      "eager": false
    }
  },
  "build": {
    "outputPath": "dist",
    "publicPath": "auto"
  },
  "devServer": {
    "hot": true,
    "historyApiFallback": true,
    "cors": true
  }
}
```

## Configuration Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Application name (must be unique) |
| `type` | `"host"` \| `"remote"` | Application type |
| `port` | number | Development server port |
| `framework` | `"react"` \| `"vue"` | Framework being used |

### Host-Specific Fields

#### remotes

Array of remote applications to load:

```json
"remotes": [
  {
    "name": "products",          // Remote name (used in imports)
    "url": "http://localhost:3001/remoteEntry.js",  // Remote URL
    "entry": "remoteEntry.js"    // Entry file name (optional)
  }
]
```

### Remote-Specific Fields

#### exposes

Modules exposed by the remote:

```json
"exposes": {
  "./App": "./src/App",                    // Main app component
  "./Button": "./src/components/Button",   // Individual components
  "./utils": "./src/utils"                 // Utility functions
}
```

### Shared Configuration

#### shared

Shared dependencies configuration:

```json
"shared": {
  "react": {
    "singleton": true,        // Only one instance across all apps
    "requiredVersion": "^18.0.0",  // Required version
    "strictVersion": false,   // Allow minor version differences
    "eager": false           // Lazy load (don't include in initial chunk)
  }
}
```

### Build Configuration

#### build

Build output configuration:

```json
"build": {
  "outputPath": "dist",      // Output directory
  "publicPath": "auto"       // Public path for assets (use "auto" for dynamic)
}
```

### Dev Server Configuration

#### devServer

Development server options:

```json
"devServer": {
  "hot": true,                    // Hot module replacement
  "historyApiFallback": true,     // SPA routing support
  "cors": true                    // Enable CORS
}
```

## How It Works

The webpack configuration reads `micro-frontend.config.json` at build time:

```javascript
// webpack.config.js (auto-generated)
const fs = require('fs');
const path = require('path');

// Read config
const mfConfig = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, 'micro-frontend.config.json'),
    'utf-8'
  )
);

// Use config to build Module Federation plugin
const moduleFederationConfig = {
  name: mfConfig.name,
  filename: 'remoteEntry.js',
  remotes: buildRemotes(mfConfig.remotes),
  exposes: mfConfig.exposes,
  shared: mfConfig.shared
};
```

## Common Tasks

### Adding a New Remote

Edit `micro-frontend.config.json`:

```json
{
  "remotes": [
    {
      "name": "newRemote",
      "url": "http://localhost:3003/remoteEntry.js"
    }
  ]
}
```

No need to modify webpack config!

### Exposing a New Module

In remote's `micro-frontend.config.json`:

```json
{
  "exposes": {
    "./App": "./src/App",
    "./NewComponent": "./src/components/NewComponent"  // Add this
  }
}
```

### Changing Port

```json
{
  "port": 3005
}
```

### Environment-Specific Configuration

Create environment-specific configs:

```bash
micro-frontend.config.json              # Default
micro-frontend.config.development.json  # Development
micro-frontend.config.production.json   # Production
```

Update webpack to read based on NODE_ENV:

```javascript
const env = process.env.NODE_ENV || 'development';
const configFile = fs.existsSync(`micro-frontend.config.${env}.json`)
  ? `micro-frontend.config.${env}.json`
  : 'micro-frontend.config.json';

const mfConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
```

### Production URLs

For production, update remote URLs:

```json
{
  "remotes": [
    {
      "name": "products",
      "url": "https://products.example.com/remoteEntry.js"
    }
  ]
}
```

## Validation

Create a JSON schema for validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "type", "port", "framework"],
  "properties": {
    "name": { "type": "string" },
    "type": { "enum": ["host", "remote"] },
    "port": { "type": "number", "minimum": 1024, "maximum": 65535 },
    "framework": { "enum": ["react", "vue"] }
  }
}
```

## Best Practices

1. **Version Control** - Commit `micro-frontend.config.json`
2. **Documentation** - Comment complex configurations
3. **Consistency** - Use same structure across all apps
4. **Environment Variables** - Don't hardcode URLs, use env vars
5. **Validation** - Add schema validation in CI/CD

## Troubleshooting

### Config Not Loading

Check file location:
```bash
ls -la micro-frontend.config.json
```

Should be in project root (same directory as webpack.config.js).

### Invalid JSON

Validate JSON syntax:
```bash
cat micro-frontend.config.json | python -m json.tool
```

### Remote Not Loading

Verify remote URL in config:
```bash
curl http://localhost:3001/remoteEntry.js
```

## Migration Guide

### From Hardcoded Webpack Config

1. Create `micro-frontend.config.json`
2. Extract Module Federation settings
3. Replace webpack.config.js with template
4. Test locally
5. Update documentation

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for complete working examples.
