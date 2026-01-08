
from playwright.sync_api import sync_playwright

def verify(page):
    page.goto('http://localhost:5173')

    # Wait for the app to load
    page.wait_for_selector('h1', state='visible')

    # Check if filter buttons exist
    buttons = page.locator('.filter-btn')
    print(f'Found {buttons.count()} filter buttons')

    # Click 'Hill Station' filter
    page.click('button[data-type="hill-station"]')

    # Wait for list update (simple wait since we don't have complex async logic yet, but animations exist)
    page.wait_for_timeout(1000)

    # Take screenshot
    page.screenshot(path='/app/verification/filters_screenshot.png')
    print('Screenshot taken')

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    try:
        verify(page)
    except Exception as e:
        print(e)
    finally:
        browser.close()
