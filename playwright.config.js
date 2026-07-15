// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Runs the Jasmine suite — built by `grunt jasmine` into spec/jasmine/ —
 * across Playwright's three bundled engines:
 *
 *   chromium → Chrome + Edge (both Chromium)
 *   firefox  → Firefox
 *   webkit   → Safari
 *
 * Playwright drives spec/jasmine/index.html in real browsers and reads the
 * results back out (see tests/jasmine.spec.js).
 */
const PORT = 8974;

module.exports = defineConfig({
	testDir: './tests',
	// The suite uses `done`-callbacks and a 500ms `sometime()` helper, so give
	// the whole run generous headroom. Must exceed the in-test poll deadline
	// (in tests/jasmine.spec.js) so the poll's own diagnostic error wins over a
	// generic Playwright timeout.
	timeout: 300 * 1000,
	fullyParallel: true,
	// One worker per browser project so chromium/firefox/webkit run concurrently.
	// Without this, Playwright's default worker count varies with CPU cores and
	// can serialize the three engines (≈3× slower).
	workers: 3,
	forbidOnly: !!process.env.CI,
	retries: 0,
	// list = console output; html = a browsable report (with the screenshots,
	// video and traces embedded) written to playwright-report/ and uploaded in CI.
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: `http://localhost:${PORT}`,
		// Always record video locally (so you can watch any run); keep CI lean
		// by recording only on failure there.
		video: process.env.CI ? 'retain-on-failure' : 'on',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure'
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
	],
	webServer: {
		command: `node tests/static-server.js ${PORT}`,
		url: `http://localhost:${PORT}/index.html`,
		reuseExistingServer: !process.env.CI,
		timeout: 30 * 1000
	}
});
