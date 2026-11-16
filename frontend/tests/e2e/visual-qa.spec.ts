import { test } from './fixtures';

test.describe('Visual Inspection and Screenshots Across Viewports', () => {
  test('captures representative screens for visual QA review', async ({ page }) => {
    // Setup API mocks
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-jwt-visual-qa',
          token_type: 'Bearer',
          user: {
            id: 'landlord-uuid',
            email: 'landlord.one@smartrent.test',
            role: 'LANDLORD',
          },
        }),
      });
    });

    await page.route('**/api/properties**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'prop-1',
              name: 'Nhà trọ SmartRent Xanh',
              address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
              status: 'ACTIVE',
              created_at: '2026-10-25T14:00:00Z',
              updated_at: '2026-10-25T14:00:00Z',
            },
            {
              id: 'prop-2',
              name: 'Khu căn hộ dịch vụ SmartRent 2',
              address: '456 Đường Lê Lợi, Quận 1, TP.HCM',
              status: 'ACTIVE',
              created_at: '2026-10-20T10:00:00Z',
              updated_at: '2026-10-20T10:00:00Z',
            },
          ],
          page: 1,
          page_size: 20,
        }),
      });
    });

    await page.route('**/api/rooms**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'room-1',
              property_id: 'prop-1',
              room_code: 'P.101',
              base_rent: 4500000,
              status: 'OCCUPIED',
            },
            {
              id: 'room-2',
              property_id: 'prop-1',
              room_code: 'P.102',
              base_rent: 4800000,
              status: 'AVAILABLE',
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
          items: [
            {
              id: 'contract-12345678',
              tenant_profile_id: 'tenant-profile-1',
              room_id: 'room-1',
              start_date: '2026-01-01',
              end_date: '2026-12-31',
              status: 'ACTIVE',
            },
          ],
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
          items: [
            {
              id: 'pay-1',
              contract_id: 'contract-12345678',
              billing_period: '2026-10-01',
              due_date: '2026-10-15',
              amount: 4500000,
              status: 'PENDING',
            },
            {
              id: 'pay-2',
              contract_id: 'contract-12345678',
              billing_period: '2026-09-01',
              due_date: '2026-09-15',
              amount: 4500000,
              status: 'PAID',
            },
          ],
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
          items: [
            {
              id: 'm-1',
              room_id: 'room-1',
              original_description: 'Vòi nước bồn rửa mặt bị rỉ nước liên tục',
              category: 'PLUMBING',
              priority: 'MEDIUM',
              ai_summary: 'Vòi sen bồn rửa mặt bị rò rỉ nước',
              ai_confidence: 0.95,
              ai_missing_information: [],
              ai_classification_status: 'CLASSIFIED',
              status: 'PENDING',
              cancellation_reason: null,
              created_at: '2026-10-25T14:00:00Z',
              updated_at: '2026-10-25T14:00:00Z',
            },
          ],
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
          items: [
            {
              id: 'notif-1',
              type: 'MAINTENANCE_CREATED',
              message: 'Khách thuê phòng P.101 vừa gửi báo cáo sự cố về vòi nước.',
              read_at: null,
              created_at: '2026-10-25T14:05:00Z',
              source: { type: 'maintenance_request', id: 'm-1' },
            },
          ],
          page: 1,
          page_size: 20,
        }),
      });
    });

    // 1. Desktop Login Page (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.screenshot({ path: 'test-results/qa-01-login-desktop.png', fullPage: true });

    // 2. Mobile Login Page (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/qa-02-login-mobile.png', fullPage: true });

    // 3. Desktop Landlord Dashboard
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('button', { name: /Chủ trọ mẫu/i }).click();
    await page.getByLabel(/^Mật khẩu/i).fill('synthetic-browser-fixture');
    await page.getByRole('button', { name: /Đăng nhập/i }).click();
    await page.waitForURL(/.*\/landlord\/dashboard/);
    await page.waitForSelector('text=2 khu trọ');
    await page.screenshot({ path: 'test-results/qa-03-landlord-dashboard-desktop.png', fullPage: true });

    // 4. Mobile Landlord Dashboard
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/qa-04-landlord-dashboard-mobile.png', fullPage: true });

    // Reset back to desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // 5. Desktop Properties Page (via sidebar navigation)
    await page.getByRole('link', { name: /Nhà trọ/i }).first().click();
    await page.waitForURL(/.*\/landlord\/properties/);
    await page.waitForSelector('text=Nhà trọ SmartRent Xanh');
    await page.screenshot({ path: 'test-results/qa-05-properties-desktop.png', fullPage: true });

    // 6. Desktop Maintenance Page
    await page.getByRole('link', { name: /Yêu cầu sửa chữa/i }).first().click();
    await page.waitForURL(/.*\/landlord\/maintenance/);
    await page.waitForSelector('text=Vòi nước bồn rửa mặt');
    await page.screenshot({ path: 'test-results/qa-06-maintenance-desktop.png', fullPage: true });

    // 7. Desktop Payments Page
    await page.getByRole('link', { name: /Hóa đơn & Thu phí/i }).first().click();
    await page.waitForURL(/.*\/landlord\/payments/);
    await page.waitForSelector('text=/4\\.500\\.000/');
    await page.screenshot({ path: 'test-results/qa-07-payments-desktop.png', fullPage: true });

    // 8. Desktop Notifications Page
    await page.getByRole('link', { name: /Thông báo/i }).first().click();
    await page.waitForURL(/.*\/notifications/);
    await page.waitForSelector('text=Khách thuê phòng P.101');
    await page.screenshot({ path: 'test-results/qa-08-notifications-desktop.png', fullPage: true });

    // 9. Desktop AI Assistant Page
    await page.getByRole('link', { name: /Trợ lý AI/i }).first().click();
    await page.waitForURL(/.*\/assistant/);
    await page.waitForSelector('text=Trợ lý AI SmartRent');
    await page.screenshot({ path: 'test-results/qa-09-assistant-desktop.png', fullPage: true });
  });
});
