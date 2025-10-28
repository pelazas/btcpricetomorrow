import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to the home page before each test
  await page.goto('http://localhost:3000/');
});

test('should allow a user to submit an "Up" vote', async ({ page }) => {
  // 1. Find the "Up" button. Use a test-specific attribute like data-testid for robustness.
  const upButton = page.getByTestId('vote-up-button');

  // 2. Click the button.
  await upButton.click();

  // 2.a Ensure the up button visually indicates the vote (background turned green)
  // Use a regex to match the utility class; Playwright will wait until the class appears.
  await expect(upButton).toHaveClass(/bg-green-500/);

  // 3. Assert that a confirmation message appears.
  const successMessage = page.getByText('Thanks for your vote! We\'ll see if you\'re right tomorrow');

  await expect(successMessage).toBeVisible();
});

test('should allow a user to submit a "Down" vote', async ({ page }) => {
  // 1. Find the "Down" button. Use a test-specific attribute like data-testid for robustness.
  const downButton = page.getByTestId('vote-down-button');

  // 2. Click the button.
  await downButton.click();
  await expect(downButton).toHaveClass(/bg-red-500/);
  const successMessage = page.getByText('Thanks for your vote! We\'ll see if you\'re right tomorrow');

  await expect(successMessage).toBeVisible();
});
