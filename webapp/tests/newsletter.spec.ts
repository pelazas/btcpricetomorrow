import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-user-${Date.now()}@example.com`;

test('should allow a user to subscribe to the newsletter', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  const emailInput = page.getByPlaceholder('Enter your email');
  await emailInput.fill(TEST_EMAIL);

  const subscribeButton = page.getByRole('button', { name: 'Subscribe' });
  await subscribeButton.click();

  const successToast = page.getByText("You've been subscribed to the newsletter.", { exact: true });
  await expect(successToast).toBeVisible();
});

test('should allow a subscribed user to unsubscribe', async ({ page, request }) => {
  await request.post('http://localhost:8000/api/newsletter/add', {
    data: { email: TEST_EMAIL },
  });

  await page.goto('http://localhost:3000/unsubscribe');

  const emailInput = page.getByPlaceholder('Enter your email');
  await emailInput.fill(TEST_EMAIL);

  const unsubscribeButton = page.getByRole('button', { name: 'Unsubscribe' });
  await unsubscribeButton.click();

  const confirmationMessage = page.getByText('Successfully unsubscribed from newsletter', { exact: true });
  await expect(confirmationMessage).toBeVisible();
});
