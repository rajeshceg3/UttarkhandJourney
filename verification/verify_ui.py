import os
import time
from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport to test the responsive logic too, or maybe desktop first
        # Let's do a large desktop view to see the sidebar and map
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        # Go to local dev server
        page.goto("http://localhost:5173")

        # Wait for loading overlay to disappear
        page.wait_for_selector('#loading-overlay', state='detached', timeout=10000)

        # Check Sidebar existence
        sidebar = page.locator('#sidebar')
        if not sidebar.is_visible():
            print("Sidebar not visible initially (on desktop it should be?)")
            # If mobile logic kicked in, toggle it
            page.click('#mobile-toggle')

        # Wait for locations to load
        page.wait_for_selector('.location-item')

        # Click the first location to see if map flies and active state works
        first_item = page.locator('.location-item').first
        first_item.click()

        # Add to trip
        add_btn = first_item.locator('button[aria-label*="Add"]')
        add_btn.click()

        # Check toast notification
        page.wait_for_selector('.toastify')

        # Take screenshot of the main UI with toast
        page.screenshot(path="verification/ui_desktop.png")
        print("Desktop screenshot taken.")

        # Now test Mobile View
        page_mobile = browser.new_page(viewport={'width': 375, 'height': 667})
        page_mobile.goto("http://localhost:5173")

        # Wait for loading
        page_mobile.wait_for_selector('#loading-overlay', state='detached')

        # Open Sidebar
        page_mobile.click('#mobile-toggle')
        page_mobile.wait_for_selector('#sidebar')

        # Take screenshot of mobile sidebar
        page_mobile.screenshot(path="verification/ui_mobile_sidebar.png")
        print("Mobile sidebar screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_ui()
