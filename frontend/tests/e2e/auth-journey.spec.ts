import { test, expect } from './fixtures';

test.describe('SmartRent Authentication and Navigation Journey', () => {
  test('redirects root to /login and renders branded login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/login/);

    // Verify brand heading and inputs
    await expect(page.getByText('SmartRent')).toBeVisible();
    await expect(page.getByText('Đăng nhập tài khoản')).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/^Mật khẩu/i)).toBeVisible();

    // Verify demo buttons exist
    await expect(page.getByRole('button', { name: /Chủ trọ mẫu/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Khách thuê mẫu/i })).toBeVisible();
  });

  test('selects a demo email and submits an explicitly supplied test password', async ({ page }) => {
    // Mock the backend login endpoint for deterministic browser E2E
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-jwt-token-playwright',
          token_type: 'Bearer',
          user: {
            id: 'e3b0c442-98fc-1c14-9afbf4c8996fb924',
            email: 'landlord.one@smartrent.test',
            role: 'LANDLORD',
          },
        }),
      });
    });

    // Mock properties & contracts query
    await page.route('**/api/properties**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'prop-1',
              name: 'Nhà trọ SmartRent Xanh',
              address: '123 Đường Nguyễn Huệ, Quận 1',
              status: 'ACTIVE',
              created_at: '2026-10-25T14:00:00Z',
              updated_at: '2026-10-25T14:00:00Z',
            },
          ],
          page: 1,
          page_size: 20,
        }),
      });
    });

    await page.route('**/api/contracts**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: 1,
          page_size: 20,
        }),
      });
    });

    await page.route('**/api/payments**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: 1,
          page_size: 20,
        }),
      });
    });

    await page.route('**/api/maintenance-requests**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: 1,
          page_size: 20,
        }),
      });
    });

    await page.route('**/api/notifications**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: 1,
          page_size: 20,
        }),
      });
    });

    await page.goto('/login');

    // Click demo account button
    await page.getByRole('button', { name: /Chủ trọ mẫu/i }).click();
    await page.getByLabel(/^Mật khẩu/i).fill('synthetic-browser-fixture');

    // Verify email input filled
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toHaveValue('landlord.one@smartrent.test');

    // Submit login
    await page.getByRole('button', { name: /Đăng nhập/i }).click();

    // Verify redirected to Landlord Dashboard
    await expect(page).toHaveURL(/.*\/landlord\/dashboard/);
    await expect(page.getByText('Trang quản lý chủ nhà')).toBeVisible();
    await expect(page.getByText('1 khu trọ')).toBeVisible();

    // Navigate to properties page
    await page.getByRole('link', { name: 'Nhà trọ' }).first().click();
    await expect(page).toHaveURL(/.*\/landlord\/properties/);
    await expect(page.getByText('Nhà trọ SmartRent Xanh')).toBeVisible();
  });

  test('responsive mobile layout has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth);
  });
});
