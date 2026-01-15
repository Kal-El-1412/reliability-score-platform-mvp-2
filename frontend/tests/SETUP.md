# Playwright Setup Requirements

## System Dependencies

Playwright's Chromium browser requires system libraries that may not be available in all environments.

### Required System Libraries

- `libnspr4`
- `libnss3`
- `libatk1.0-0`
- `libatk-bridge2.0-0`
- And other X11/graphics libraries

### Installation Options

#### Option 1: Install with System Dependencies (Recommended for CI/Production)

```bash
npx playwright install --with-deps chromium
```

**Note**: This requires `sudo`/root access to install system packages.

#### Option 2: Use Docker (Recommended for Development)

Use the official Playwright Docker image which includes all dependencies:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "test:smoke"]
```

#### Option 3: Manual System Library Installation

On Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2
```

### Current Environment Limitation

If you're seeing errors about missing `libnspr4.so`, your environment doesn't have the required system libraries installed and may not have root access to install them.

### Workarounds

1. **Run in Docker**: Use Playwright's official Docker image
2. **Run in CI with system deps**: GitHub Actions can install system dependencies
3. **Use a different testing approach**: Consider lighter-weight alternatives like jsdom for basic smoke tests

### Verification

To check if Chromium can launch:

```bash
npx playwright test --headed
```

If you see library errors, you'll need to install system dependencies or use Docker.
