# Verify UttarkhandJourney
Uttarakhand Journey - trip planner for Uttarakhand (vite, vitest, playwright e2e config).
## Launch
npm install, then npm run dev or npm run build && npm run preview.
## Doctor
`python3 .cursor/skills/verify-uttarkhand-journey/verify.py`
## Drive
Runs the vitest suite, builds with vite, renders the built app in headless Chromium asserting the boot marker and zero JS console errors.
## Evidence
`.cursor/skills/verify-uttarkhand-journey/evidence.json`
## Cleanup
Static server terminated after the render.
## Known boundaries
Render smoke only; scene quality and e2e suites (cypress/playwright/puppeteer) not exercised here.
