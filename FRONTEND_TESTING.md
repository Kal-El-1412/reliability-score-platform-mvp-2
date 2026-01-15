# Frontend Verification System

This document explains the frontend smoke testing setup for the Reliability Score Platform.

## Overview

The frontend uses **two approaches** for smoke testing:

1. **Component-Level Tests** (Jest + React Testing Library) - For WASM environments like Bolt/Stackblitz
2. **End-to-End Tests** (Playwright) - For local development and CI/CD

### Component-Level Tests (Recommended for Bolt)

Uses Jest with jsdom to test React components in isolation:
- No need to start Next.js dev server
- Works in WASM environments (Bolt/Stackblitz)
- Fast and reliable
- Tests component rendering and UI presence

### End-to-End Tests (Playwright)

Uses Playwright to test the full application:
- Starts Next.js dev server automatically
- Tests in a real browser environment
- Requires native Node.js runtime (not WASM)
- Best for local development and CI/CD

## WASM Environment Limitations

**IMPORTANT**: In WASM-based environments like Bolt or Stackblitz, Playwright's webServer feature fails with:

```
Error: `turbo.createProject` is not supported by the wasm bindings.
```

This occurs because:
- Next.js 16+ uses Turbopack by default in development
- Turbopack requires native bindings that aren't available in WASM
- Even with `TURBOPACK=0`, system dependencies (like `libnspr4.so`) may be missing

**Solution**: Use component-level tests instead of Playwright in WASM environments.

## Quick Start

### Default Smoke Tests (Jest Component Tests)

The default smoke test uses Jest + React Testing Library and works everywhere, including WASM environments:

```bash
# From repository root
npm run test:frontend:smoke

# From frontend directory
cd frontend
npm run test:smoke
```

### Optional Playwright E2E Smoke Tests (Local/CI only)

For browser-based end-to-end testing (requires native Node.js runtime):

```bash
# From frontend directory only
cd frontend
npm run test:smoke:playwright
```

### System Requirements

Playwright requires system libraries to run Chromium. If you encounter errors about missing `libnspr4.so` or similar libraries, see `/frontend/tests/SETUP.md` for installation options.

**For CI/CD**: GitHub Actions can install dependencies automatically (see workflow file)
**For Local Development**: May require `sudo` to install system libraries or use Docker

## What Gets Tested

### Component-Level Smoke Tests

Verify that key UI components render without errors:

1. **Login Page Component** - Renders with all form elements and text
2. **Core UI Elements** - Headers, buttons, inputs are present
3. **No Runtime Errors** - Component tree doesn't crash during render

### Playwright E2E Smoke Tests

Verify full application behavior:

1. **Homepage Redirect** - Root path redirects to login or dashboard
2. **Login Page** - All form elements and links are present
3. **Register Page** - Registration UI renders correctly
4. **Page Metadata** - Pages have proper titles

## Test Structure

```
frontend/
├── jest.config.cjs         # Jest configuration
├── jest.setup.ts           # Jest setup (testing-library/jest-dom)
├── __tests__/
│   └── smoke.test.tsx      # Component smoke tests
├── playwright.config.ts    # Playwright configuration
├── tests/
│   ├── smoke.spec.ts       # Playwright smoke tests
│   └── README.md           # Test documentation
└── package.json            # Test scripts
```

## Configuration Details

### Jest Config (`frontend/jest.config.cjs`)

- **Test Environment**: jsdom (simulates browser DOM)
- **Transform**: ts-jest for TypeScript/TSX files
- **Module Name Mapper**: Supports Next.js `@/` path alias
- **Setup Files**: `jest.setup.ts` loads testing-library/jest-dom

Key features:
```javascript
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  }
}
```

### Playwright Config (`frontend/playwright.config.ts`)

- **Base URL**: `http://localhost:3000`
- **Test Timeout**: 60 seconds
- **Auto-start Server**: Yes (starts `npm run dev:test` with Turbopack disabled)
- **Browser**: Chromium (can extend to Firefox, WebKit)
- **CI Retries**: 2 attempts on failure

### Web Server

Playwright automatically starts the Next.js dev server before running tests:

```typescript
webServer: {
  command: 'npm run dev:test',  // Uses TURBOPACK=0
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

## CI/CD Integration

### GitHub Actions Workflow

Location: `.github/workflows/frontend-smoke.yml`

**Triggers:**
- Push to main/master branches
- Pull requests

**Steps:**
1. Checkout repository
2. Setup Node.js 20
3. Install frontend dependencies
4. Install Playwright browsers
5. Run smoke tests
6. Upload test reports and screenshots on failure

**Artifacts:**
- `playwright-report/` - HTML test report
- `test-results/` - Screenshots and traces from failed tests

## Running Tests Locally

### Default Smoke Tests (Jest Component Tests)

```bash
# From repository root
npm run test:frontend:smoke

# From frontend directory
cd frontend
npm install
npm run test:smoke

# Watch mode (re-run on file changes)
npm run test:smoke -- --watch

# Verbose output
npm run test:smoke -- --verbose
```

### Playwright E2E Tests

#### First Time Setup

```bash
# Install frontend dependencies
cd frontend
npm install

# Install Playwright browsers
npx playwright install chromium
```

#### Run Tests

```bash
# With UI (useful for debugging)
cd frontend
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Run specific test
npx playwright test smoke.spec.ts
```

## Test Results

After running tests, view the HTML report:

```bash
cd frontend
npx playwright show-report
```

## When to Use Each Test Type

### Default: Jest Component Tests

The default `npm run test:smoke` command uses Jest + React Testing Library.

**Use this for:**
- Working in Bolt/Stackblitz (WASM environments)
- Quick verification after code changes
- Testing component rendering in isolation
- CI/CD pipeline fast feedback
- Any environment where system dependencies are unavailable
- **This is the recommended default for all smoke testing**

### Optional: Playwright E2E Tests

Available via `npm run test:smoke:playwright` in the frontend directory.

**Use this when:**
- Working on local development machine with native Node.js
- Running in CI/CD with full runtime capabilities
- Need to test navigation and routing behavior
- Testing interactions between multiple pages
- Need to verify production-like browser behavior

## Adding New Smoke Tests

### Adding to Default Smoke Tests (Component Tests)

When adding critical new pages or features to the default smoke test suite:

1. Open `frontend/__tests__/smoke.test.tsx`
2. Add a new test case:

```typescript
test('new feature component renders', () => {
  render(<NewFeaturePage />);

  // Check heading is present
  expect(screen.getByRole('heading', { name: /Feature Title/i }))
    .toBeInTheDocument();

  // Check key elements exist
  expect(screen.getByRole('button', { name: /Action/i }))
    .toBeInTheDocument();
});
```

3. Mock any required providers or hooks (AuthContext, QueryClient, etc.)

### Adding Playwright E2E Tests (Optional)

When adding browser-based end-to-end tests:

1. Open `frontend/tests/smoke.spec.ts`
2. Add a new test:

```typescript
test('new feature page loads', async ({ page }) => {
  await page.goto('/new-feature');

  // Check page loaded
  await expect(page.getByRole('heading', { name: /Feature Title/i }))
    .toBeVisible();

  // Check key elements exist
  await expect(page.getByRole('button', { name: /Action/i }))
    .toBeVisible();
});
```

3. Keep tests fast and simple (under 5 seconds each)

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in playwright.config.ts
```

### Tests Timeout

If tests timeout waiting for server:

1. Check `frontend/.env.local` has correct API URL
2. Increase timeout in `playwright.config.ts`:

```typescript
webServer: {
  timeout: 180000, // 3 minutes
}
```

### Browser Installation Issues

```bash
# Reinstall browsers with dependencies
npx playwright install --with-deps chromium
```

## Best Practices

1. **Keep tests focused** - Each test should verify one clear thing
2. **Use semantic selectors** - Prefer `getByRole`, `getByLabel` over CSS selectors
3. **Make tests independent** - Tests should not depend on each other
4. **Keep tests fast** - Smoke tests should complete in under 30 seconds total
5. **Don't test business logic** - Smoke tests verify UI renders, not functionality

## What Smoke Tests Do NOT Cover

Smoke tests are NOT comprehensive e2e tests. They don't:

- Test authentication flows
- Make real API calls
- Test form submissions
- Validate business logic
- Test complex user journeys

For comprehensive testing, implement separate e2e test suites.

## Environment Variables

Tests use the following environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1
```

Set in `frontend/.env.local` for local development.

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Frontend Tests README](./frontend/tests/README.md)
