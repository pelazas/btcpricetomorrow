import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-user-${Date.now()}@example.com`;

test('should allow a user to subscribe to the newsletter', async ({ page }) => {
  // 1. Navigate to the home page.
  await page.goto('http://localhost:3000/');

  // 2. Find the email input field and fill it.
  const emailInput = page.getByPlaceholder('Enter your email');
  await emailInput.fill(TEST_EMAIL);

  // 3. Find and click the subscribe button.
  const subscribeButton = page.getByRole('button', { name: 'Subscribe' });
  await subscribeButton.click();

  // 4. Assert that a success message is shown.
  // Use an exact text match to avoid matching the same substring inside a notification wrapper
  const successToast = page.getByText("You've been subscribed to the newsletter.", { exact: true });
  await expect(successToast).toBeVisible();
});

test('should allow a subscribed user to unsubscribe', async ({ page, request }) => {
  // Ensure the test is independent: create a subscription via the API so the unsubscribe flow can run reliably.
  // The API server is mounted at /api/newsletter in the project; the API base used by the app is http://localhost:8000/api
  await request.post('http://localhost:8000/api/newsletter/add', {
    data: { email: TEST_EMAIL },
  });

  // 1. Navigate to the unsubscribe page.
  await page.goto('http://localhost:3000/unsubscribe');

  // 2. Find the email input and fill it with the same email.
  const emailInput = page.getByPlaceholder('Enter your email');
  await emailInput.fill(TEST_EMAIL);

  // 3. Find and click the unsubscribe button.
  const unsubscribeButton = page.getByRole('button', { name: 'Unsubscribe' });
  await unsubscribeButton.click();

  // 4. Assert that the confirmation message is displayed.
  // Use exact match so the locator doesn't resolve both the small message and the notification wrapper
  const confirmationMessage = page.getByText('Successfully unsubscribed from newsletter', { exact: true });
  await expect(confirmationMessage).toBeVisible();
});
