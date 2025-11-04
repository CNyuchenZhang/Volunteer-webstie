import { test, expect } from '@playwright/test';

test('frontend health page returns 200', async ({ page }) => {
  const res = await page.request.get('http://localhost:8080/health');
  expect(res.ok()).toBeTruthy();
});

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Volunteer|志愿者|Vite/);
});

