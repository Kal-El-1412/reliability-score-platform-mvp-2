import { test, expect } from '@playwright/test';

test('homepage loads and displays expected content', async ({ page }) => {
  await page.goto('/');

  // Check that the page contains expected text
  const body = await page.textContent('body');

  // Assert that at least one of these terms appears on the homepage
  const hasExpectedContent =
    body?.includes('Reliability') ||
    body?.includes('Login') ||
    body?.includes('Dashboard');

  expect(hasExpectedContent).toBeTruthy();
});
