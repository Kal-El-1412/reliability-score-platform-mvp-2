# Stackblitz Compatibility Guide

## Issue: Turbopack WASM Error

When opening this project in Stackblitz, you may encounter:

```
Error: `turbo.createProject` is not supported by the wasm bindings.
```

### Root Cause

- **Next.js 16+** enables Turbopack by default in development mode
- **Stackblitz** uses WASM bindings (`@next/swc-wasm-nodejs`) instead of native binaries
- **Turbopack's** advanced features like `turbo.createProject` are not supported in WASM mode

### Solution Applied ✅

The project is now configured for Stackblitz compatibility:

#### 1. Separate Test Script with Turbopack Disabled

**File**: `/frontend/package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:test": "TURBOPACK=0 next dev -p 3000"
  }
}
```

The `dev:test` script uses `TURBOPACK=0` environment variable to completely disable Turbopack for testing environments (Playwright, CI/CD).

#### 2. Playwright Configuration

**File**: `/frontend/playwright.config.ts`

```typescript
webServer: {
  command: 'npm run dev:test',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

Playwright uses the `dev:test` script to ensure Turbopack is disabled during test execution.

#### 3. Configuration Note

**File**: `/frontend/next.config.js`

Added documentation comment explaining the Stackblitz/WASM compatibility approach.

### Impact

- ✅ **Stackblitz**: Works with WASM bindings when using `TURBOPACK=0`
- ✅ **Local Development**: Can use Turbopack (default Next.js 16+ behavior)
- ✅ **Playwright Tests**: Runs without Turbopack via `dev:test` script
- ✅ **Production Builds**: Unaffected (always uses optimized compiler)

### How It Works

The regular `dev` script runs Next.js normally (with Turbopack enabled by default in Next.js 16+), while the `dev:test` script explicitly disables Turbopack using the `TURBOPACK=0` environment variable. This allows:

- **Local development** to use Turbopack for faster builds
- **Playwright tests** to run in a WASM-compatible environment
- **Flexibility** across different execution contexts

### Testing the Fix

After the fix, Playwright tests should:

1. ✅ Start the dev server with `TURBOPACK=0`
2. ✅ No Turbopack WASM binding errors
3. ✅ Run smoke tests successfully
4. ✅ All routes load properly during tests

To verify:

```bash
npm run test:frontend:smoke
```

The test should start the Next.js dev server without Turbopack errors.

### Additional Notes

- The fix ensures **broad environment compatibility**
- Webpack is the stable, battle-tested bundler for Next.js
- Turbopack is newer and faster but has platform limitations
- This configuration prioritizes **compatibility over speed**

### References

- [Next.js Turbopack Documentation](https://nextjs.org/docs/app/api-reference/turbopack)
- [Stackblitz WASM Limitations](https://developer.stackblitz.com/platform/api/javascript-sdk)
- [Next.js CLI Options](https://nextjs.org/docs/app/api-reference/next-cli)
