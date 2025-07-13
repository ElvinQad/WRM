# Performance Optimizations for WRM Development

## Current Issues
- **Slow startup**: 50+ seconds to download dependencies
- **Large dependency tree**: 305+ npm packages
- **Multiple frameworks**: NestJS + Next.js + Jest = heavy setup

## Implemented Fixes
1. ✅ Fixed CommonJS module issue in `next.config.js`
2. ✅ Enabled `nodeModulesDir: "auto"` for lifecycle scripts
3. ✅ Fixed import extensions (`.ts`)
4. ✅ Sequential builds (types → backend & frontend)

## Recommended Further Optimizations

### 1. Use Deno's Built-in Tools
```json
{
  "tasks": {
    "dev:backend-minimal": "deno run --allow-all --watch src/main.ts",
    "test:deno": "deno test --allow-all",
    "lint:deno": "deno lint",
    "fmt:deno": "deno fmt"
  }
}
```

### 2. Reduce Dependencies
**Backend alternatives:**
- Replace Jest → Deno's built-in test runner
- Replace NestJS → Hono or Oak (lighter frameworks)
- Replace Swagger → Simple OpenAPI generation

**Frontend alternatives:**
- Replace Create React App/Next.js → Vite + React (faster)
- Replace heavy UI libs → Lightweight alternatives

### 3. Development Workflow
```bash
# Instead of running all services:
deno task dev:backend  # Terminal 1
deno task dev:frontend # Terminal 2 (separate)

# Or use development profile:
deno task dev:minimal  # Lighter services only
```

### 4. Dockerfile for Consistency
```dockerfile
FROM denoland/deno:alpine
WORKDIR /app
COPY . .
RUN deno cache --reload packages/*/deno.json
CMD ["deno", "task", "dev"]
```

### 5. Caching Strategy
```bash
# Pre-cache dependencies
deno cache --reload --lock-write packages/*/deno.json

# Use lock file for consistent installs
git add deno.lock
```

## Expected Results
- **Before**: 50+ seconds startup
- **After optimizations**: ~10-15 seconds
- **With minimal stack**: ~3-5 seconds

## Migration Path
1. **Phase 1**: Current fixes (✅ done)
2. **Phase 2**: Replace Jest with Deno test
3. **Phase 3**: Evaluate lighter framework alternatives
4. **Phase 4**: Optimize frontend bundle

## Current Status
The project now starts faster due to the fixes implemented, but the fundamental issue is the heavy dependency tree. Consider gradually migrating to Deno-native solutions for maximum performance.
