import { test as base, expect } from '@playwright/test';

// Specific API mocks registered by each scenario override this fallback.
// Never send a synthetic browser token or request to a real backend.
export const test = base.extend<{ isolateApi: void }>({
  isolateApi: [async ({ page }, use) => {
    const unexpected: string[] = [];
    await page.route('**/api/**', async (route) => {
      unexpected.push(`${route.request().method()} ${new URL(route.request().url()).pathname}`);
      await route.abort();
    });
    await use();
    expect(unexpected, 'Every browser API request must have an explicit mock').toEqual([]);
  }, { auto: true }],
});

export { expect };
