import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
});

test('should allow a user to submit an "Up" vote', async ({ page }) => {
  const upButton = page.getByTestId('vote-up-button');

  await upButton.click();

  await expect(upButton).toHaveClass(/bg-green-500/);
  const successMessage = page.getByText('Thanks for your vote! We\'ll see if you\'re right tomorrow');
  await expect(successMessage).toBeVisible();
});

test('should allow a user to submit a "Down" vote', async ({ page }) => {
  const downButton = page.getByTestId('vote-down-button');

  await downButton.click();
  await expect(downButton).toHaveClass(/bg-red-500/);
  const successMessage = page.getByText('Thanks for your vote! We\'ll see if you\'re right tomorrow');

  await expect(successMessage).toBeVisible();
});
