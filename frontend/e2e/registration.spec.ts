
import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
    test('should display registration form correctly', async ({ page }) => {
        // Navigate to registration page
        await page.goto('/en/auth/register');

        // Check for critical elements
        await expect(page.getByText('Choose Your Plan')).toBeVisible();
        await expect(page.getByText('Start with a free trial')).toBeVisible();

        // Verify Plan Cards exist
        await expect(page.getByText('Individual')).toBeVisible();
        await expect(page.getByText('Business Starter')).toBeVisible();

        // Verify Toggle works
        const toggleMonthly = page.getByRole('button', { name: 'Monthly' });
        const toggleYearly = page.getByRole('button', { name: 'Yearly' });

        await expect(toggleMonthly).toBeVisible();
        await expect(toggleYearly).toBeVisible();

        // Click Yearly and check if price updates (Mock check since we don't have full interaction setup)
        await toggleYearly.click();
        await expect(page.getByText('/ano')).toBeVisible(); // Annual price indicator
    });
});
