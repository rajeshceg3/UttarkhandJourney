from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for locations to load
        print("Waiting for locations...")
        page.wait_for_selector(".location-item")

        # Find the first 'Add' button
        add_btn = page.locator(".add-sidebar-btn").first

        # Get the location title for verification
        location_title = page.locator(".location-item h3").first.inner_text()
        print(f"Testing undo for: {location_title}")

        # Click Add
        print("Clicking Add...")
        add_btn.click()

        # Verify Toast appears
        print("Waiting for Toast...")
        toast = page.locator(".toastify")
        expect(toast).to_contain_text("Added to your trip! Click to Undo.")

        # Verify Itinerary has the item
        itinerary_item = page.locator(".itinerary-item", has_text=location_title)
        expect(itinerary_item).to_be_visible()

        # Click the Toast to Undo
        print("Clicking Toast to Undo...")
        toast.click()

        # Verify Undo Toast appears
        print("Waiting for Undo Toast...")
        undo_toast = page.locator(".toastify", has_text="Action undone.")
        expect(undo_toast).to_be_visible()

        # Verify Itinerary does NOT have the item
        print("Verifying item removed...")
        expect(itinerary_item).not_to_be_visible()

        # Verify Add button is enabled again (not disabled)
        # Note: In the code, disabled attribute is used.
        expect(add_btn).not_to_be_disabled()

        print("Taking screenshot...")
        page.screenshot(path="verification/undo_verification.png")
        print("Done.")
        browser.close()

if __name__ == "__main__":
    run()
