from playwright.sync_api import sync_playwright, expect
import time
import re

def verify_polish(page):
    # Desktop View
    print("Verifying Desktop View...")
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto("http://localhost:5173")

    # Wait for loading overlay to disappear
    page.wait_for_selector("#loading-overlay", state="hidden", timeout=10000)

    # Wait for map and sidebar
    page.wait_for_selector("#map")
    page.wait_for_selector("#sidebar")

    # Verify Filters
    print("Checking filters...")
    filters = page.locator(".filter-btn")
    expect(filters.first).to_be_visible()

    # Take Desktop Screenshot
    time.sleep(1) # Let animations settle
    page.screenshot(path="/home/jules/verification/desktop_polish.png")
    print("Desktop screenshot saved.")

    # Mobile View
    print("Verifying Mobile View...")
    page.set_viewport_size({"width": 375, "height": 812})

    # Reload to trigger mobile layout logic if needed (e.g. initial sidebar state)
    page.reload()
    page.wait_for_selector("#loading-overlay", state="hidden")

    # Verify Mobile Toggle (Explore Button)
    explore_btn = page.locator("#mobile-toggle")
    expect(explore_btn).to_be_visible()

    # Take Mobile Initial Screenshot (Map + Explore Button)
    time.sleep(1)
    page.screenshot(path="/home/jules/verification/mobile_initial.png")

    # Open Bottom Sheet
    print("Opening Bottom Sheet...")
    explore_btn.click()

    # Wait for sheet animation
    time.sleep(1)

    # Verify Sheet is visible (translateY(0))
    # Note: Logic is sidebar has class translate-x-0 which maps to translateY(0) in CSS media query
    sidebar = page.locator("#sidebar")
    # Using regex to check for class presence since exact string match might fail if other classes exist
    expect(sidebar).to_have_class(re.compile(r"translate-x-0"))

    page.screenshot(path="/home/jules/verification/mobile_sheet_open.png")
    print("Mobile Sheet screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_polish(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
