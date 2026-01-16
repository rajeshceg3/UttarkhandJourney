import { test, expect } from '@playwright/test';

test.describe('Core User Journey', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Uttarakhand/i);
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.getByText('Discover the Land of Gods')).toBeVisible();
  });

  test('should allow adding and removing destinations', async ({ page }) => {
    // 1. Filter by 'pilgrimage'
    const filterBtn = page.locator('.filter-btn[data-type="pilgrimage"]');
    await filterBtn.click();
    await expect(filterBtn).toHaveClass(/active/);

    // 2. Find a specific location (e.g., Kedarnath)
    const locationItem = page.locator('.location-item').filter({ hasText: 'Kedarnath' });
    await expect(locationItem).toBeVisible();

    // 3. Add to Trip
    const addButton = locationItem.getByRole('button', { name: /Add.*to trip/i });
    await addButton.click();

    // 4. Verify Toast
    await expect(page.getByText('Added to your trip!')).toBeVisible();

    // 5. Verify Itinerary Update
    const itineraryItem = page.locator('.itinerary-item').filter({ hasText: 'Kedarnath' });
    await expect(itineraryItem).toBeVisible();

    // 6. Verify Button State (Disabled/Checked)
    await expect(addButton).toBeDisabled();

    // 7. Persist after reload
    await page.reload();
    await expect(page.locator('.itinerary-item').filter({ hasText: 'Kedarnath' })).toBeVisible();

    // 8. Remove from Trip
    const removeButton = itineraryItem.getByRole('button', { name: /Remove/i });
    await removeButton.click();
    await expect(itineraryItem).not.toBeVisible();

    // 9. Undo Removal
    const undoToast = page.getByText('Removed from trip. Click to Undo.');
    await expect(undoToast).toBeVisible();
    await undoToast.click();
    await expect(page.locator('.itinerary-item').filter({ hasText: 'Kedarnath' })).toBeVisible();
  });

  test('should handle clear all functionality with confirmation', async ({ page }) => {
    // Add two items
    const loc1 = page.locator('.location-item').nth(0);
    const loc2 = page.locator('.location-item').nth(1);

    await loc1.getByRole('button').click();
    await loc2.getByRole('button').click();

    await expect(page.locator('.itinerary-item')).toHaveCount(2);

    // Click Clear All
    const clearAllBtn = page.getByRole('button', { name: 'Clear All' });
    await clearAllBtn.click();

    // Verify Modal
    const modal = page.locator('#location-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Are you sure?');

    // Cancel
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).toBeHidden();
    await expect(page.locator('.itinerary-item')).toHaveCount(2);

    // Clear All again and Confirm
    await clearAllBtn.click();
    await modal.getByRole('button', { name: 'Yes, Clear It' }).click();

    await expect(modal).toBeHidden();
    await expect(page.locator('.itinerary-item')).toHaveCount(0);
    await expect(page.getByText('Start adding destinations')).toBeVisible();
  });

  test('should show details modal when clicking More Info in map popup', async ({ page }) => {
    // 1. Click sidebar item to fly to location and open popup
    const locationItem = page.locator('.location-item').first();
    const title = await locationItem.locator('h3').textContent();

    // Click content to trigger map flyTo and popup
    await locationItem.locator('div').first().click();

    // 2. Wait for Popup
    const popup = page.locator('.leaflet-popup-content');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText(title);

    // 3. Click More Info
    await popup.getByRole('button', { name: 'More Info' }).click();

    // 4. Verify Modal
    const modal = page.locator('#location-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toHaveText(title);

    // 5. Close Modal
    await modal.getByRole('button', { name: 'Close modal' }).click();
    await expect(modal).toBeHidden();
  });
});
