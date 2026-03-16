import { test, expect } from '@playwright/test';

const NAVIGATION_TIMEOUT = 10_000;

test.describe('Authentication flow', () => {
  test.describe('Unauthenticated access', () => {
    test('root page redirects to login', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
    });

    test('dashboard redirects to login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('projects page redirects to login', async ({ page }) => {
      await page.goto('/projects');
      await expect(page).toHaveURL(/\/login/);
    });

    test('login page displays correctly', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('h1')).toHaveText('POM');
      await expect(page.locator('input#pseudo')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
    });
  });

  test.describe('Login with valid credentials', () => {
    test('admin can log in and sees dashboard', async ({ page }) => {
      await page.goto('/login');

      await page.locator('input#pseudo').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.getByRole('button', { name: /se connecter/i }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: NAVIGATION_TIMEOUT });
      await expect(page.locator('text=Bonjour')).toBeVisible({ timeout: NAVIGATION_TIMEOUT });
    });

    test('login with wrong credentials shows error', async ({ page }) => {
      await page.goto('/login');

      await page.locator('input#pseudo').fill('admin');
      await page.locator('input#password').fill('wrongpassword');
      await page.getByRole('button', { name: /se connecter/i }).click();

      await expect(page.locator('text=Identifiants incorrects')).toBeVisible({ timeout: NAVIGATION_TIMEOUT });
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Logout and re-login', () => {
    test('user can logout and is redirected to login', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.locator('input#pseudo').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: NAVIGATION_TIMEOUT });

      // Logout
      await page.getByRole('button', { name: /déconnexion/i }).click();
      await expect(page).toHaveURL(/\/login/, { timeout: NAVIGATION_TIMEOUT });
    });

    test('user can login again after logout without server error', async ({ page }) => {
      // First login
      await page.goto('/login');
      await page.locator('input#pseudo').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: NAVIGATION_TIMEOUT });

      // Logout
      await page.getByRole('button', { name: /déconnexion/i }).click();
      await expect(page).toHaveURL(/\/login/, { timeout: NAVIGATION_TIMEOUT });

      // Re-login with different user
      await page.locator('input#pseudo').fill('smartin');
      await page.locator('input#password').fill('manager123');
      await page.getByRole('button', { name: /se connecter/i }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: NAVIGATION_TIMEOUT });
      await expect(page.locator('text=Bonjour')).toBeVisible({ timeout: NAVIGATION_TIMEOUT });
    });
  });

  test.describe('Authenticated redirect', () => {
    test('authenticated user visiting /login is redirected to dashboard', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.locator('input#pseudo').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: NAVIGATION_TIMEOUT });

      // Try to visit login page while authenticated
      await page.goto('/login');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: NAVIGATION_TIMEOUT });
    });
  });
});
