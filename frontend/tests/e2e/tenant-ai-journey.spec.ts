import { test, expect } from '@playwright/test';

test.describe('Tenant Maintenance AI Preview and Assistant Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login as tenant
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'tenant-token-playwright',
          token_type: 'Bearer',
          user: {
            id: 'tenant-user-uuid',
            email: 'tenant.one@smartrent.test',
            role: 'TENANT',
          },
        }),
      });
    });

    // Mock active contracts
    await page.route('**/api/contracts**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'contract-t1',
              tenant_profile_id: 'tenant-profile-1',
              room_id: 'room-101-uuid',
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

    // Mock payments
    await page.route('**/api/payments**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'payment-t1',
              contract_id: 'contract-t1',
              billing_period: '2026-10-01',
              due_date: '2026-10-15',
              amount: 3500000,
              status: 'PENDING',
            },
          ],
          page: 1,
          page_size: 20,
        }),
      });
    });

    // Mock maintenance requests
    await page.route('**/api/maintenance-requests', async (route) => {
      if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'maint-created-1',
            room_id: body.room_id,
            original_description: body.original_description,
            category: 'PLUMBING',
            priority: 'MEDIUM',
            ai_summary: 'Vòi nước bị rò rỉ liên tục',
            ai_confidence: 0.95,
            ai_missing_information: [],
            ai_classification_status: 'CLASSIFIED',
            status: 'PENDING',
            cancellation_reason: null,
            created_at: '2026-10-25T14:40:00Z',
            updated_at: '2026-10-25T14:40:00Z',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [],
            page: 1,
            page_size: 20,
          }),
        });
      }
    });

    // Mock preview endpoint
    await page.route('**/api/maintenance-requests/preview', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room_id: body.room_id,
          original_description: body.original_description,
          ai_classification_status: 'CLASSIFIED',
          classification: {
            category: 'PLUMBING',
            priority: 'MEDIUM',
            summary: 'Vòi nước bồn rửa mặt bị rò rỉ liên tục',
            missing_information: [],
            confidence: 0.96,
          },
          preview_token: 'preview-token-12345',
          expires_at: '2026-10-25T14:45:00Z',
        }),
      });
    });

    // Mock AI Assistant message
    await page.route('**/api/ai-assistant/messages', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'Hóa đơn tiền phòng kỳ này của bạn là 3.500.000 ₫, hạn nộp ngày 15/10/2026.',
          requires_more_information: false,
        }),
      });
    });

    // Mock notifications
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
  });

  test('tenant logs in and views tailored dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Khách thuê mẫu/i }).click();
    await page.getByRole('button', { name: /Đăng nhập/i }).click();

    await expect(page).toHaveURL(/.*\/tenant\/dashboard/);
    await expect(page.getByText('Không gian khách thuê')).toBeVisible();
    await expect(page.getByText('3.500.000 ₫')).toBeVisible();
  });

  test('tenant creates maintenance request with AI preview and explicit confirmation', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Khách thuê mẫu/i }).click();
    await page.getByRole('button', { name: /Đăng nhập/i }).click();

    // Navigate to maintenance page
    await page.getByRole('link', { name: /Báo sửa chữa/i }).first().click();
    await expect(page).toHaveURL(/.*\/tenant\/maintenance/);

    // Click "Báo sự cố mới"
    await page.getByRole('button', { name: /Báo sự cố mới/i }).click();
    await expect(page.getByText('Báo sự cố tiện ích phòng')).toBeVisible();

    // Select room & fill description
    await page.getByLabel(/Chọn phòng gặp sự cố/i).selectOption('room-101-uuid');
    await page
      .getByLabel(/Mô tả sự cố chi tiết/i)
      .fill('Vòi nước bồn rửa mặt bị rò rỉ nước liên tục từ hôm qua');

    // Step 2: Trigger AI preview
    await page.getByRole('button', { name: /Phân tích với AI/i }).click();

    // Step 3: Verify preview result displays
    await expect(page.getByText('Xem trước phân tích AI')).toBeVisible();
    await expect(page.getByText('Nước / Vệ sinh')).toBeVisible();
    await expect(page.getByText(/Vòi nước bồn rửa mặt bị rò rỉ liên tục/i)).toBeVisible();

    // Step 4: Explicit Confirm
    await page.getByRole('button', { name: /Xác nhận gửi yêu cầu/i }).click();

    // Dialog closes
    await expect(page.getByText('Xem trước phân tích AI')).not.toBeVisible();
  });

  test('tenant asks AI Assistant a question and receives answer', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Khách thuê mẫu/i }).click();
    await page.getByRole('button', { name: /Đăng nhập/i }).click();

    await page.getByRole('link', { name: /Trợ lý AI/i }).first().click();
    await expect(page).toHaveURL(/.*\/assistant/);

    await expect(page.getByText('Trợ lý AI SmartRent')).toBeVisible();

    // Type question and send
    await page.getByPlaceholder(/Nhập câu hỏi cần hỗ trợ/i).fill('Hạn thanh toán tiền phòng kỳ này?');
    await page.getByRole('button', { name: /Gửi/i }).click();

    // Verify AI response
    await expect(
      page.getByText(/Hóa đơn tiền phòng kỳ này của bạn là 3.500.000 ₫/i)
    ).toBeVisible();
  });
});
