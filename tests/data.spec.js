// @ts-check
import { test, expect } from '@playwright/test';

test.describe('User Management App', () => {

  // A test to check if the main components load correctly.
  test('should display the navigation bar and form', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with your app's URL

    // Expect the navbar with the title and logo to be visible.
    await expect(page.locator('nav.navbar')).toBeVisible();
    await expect(page.locator('.navbar-brand')).toHaveText('Integration Ninja');

    // Expect the form to add users to be visible.
    await expect(page.locator('form h2')).toHaveText('Add Users');
    await expect(page.locator('form')).toBeVisible();
  });

  // A test to add a new user and verify the result.
  test('should successfully add a new user', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with your app's URL

    // Fill out the form with new user data.
    const userNameInput = page.locator('input[name="name"]');
    const userEmailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    await userNameInput.fill('John Doe');
    await userEmailInput.fill('john.doe@example.com');

    // Mock the API response to avoid actual network calls.
    await page.route('**/addUser', async route => {
      const json = { message: 'User created successfully' };
      await route.fulfill({ status: 200, json });
    });

    // Listen for the alert message after submission.
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('User created successfully');
      await dialog.accept();
    });

    // Click the submit button.
    await submitButton.click();

    // Verify that the form fields are cleared after submission.
    await expect(userNameInput).toHaveValue('');
    await expect(userEmailInput).toHaveValue('');
  });

  // A test to verify if the list of users is displayed correctly.
  test('should display the list of users', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with your app's URL

    // Mock the API response for the list of users.
    await page.route('**/getUsers', async route => {
      const users = [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
      ];
      await route.fulfill({ status: 200, json: users });
    });
    
    // Reload the page to trigger the useEffect hook with the mocked data.
    await page.reload();

    // Expect the user list to be visible.
    const userList = page.locator('.col ul');
    await expect(userList).toBeVisible();

    // Expect the two users to be present in the list.
    const firstUser = userList.locator('tl', { hasText: 'Alice' });
    const secondUser = userList.locator('tl', { hasText: 'Bob' });

    await expect(firstUser).toBeVisible();
    await expect(secondUser).toBeVisible();
  });
});