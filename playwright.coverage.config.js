// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const base = require('./playwright.config');

/**
 * Code-coverage config: runs the Jasmine suite once in Chromium with V8
 * coverage collection (see tests/coverage.collect.js). Chromium only, since
 * V8 coverage isn't available in Firefox/WebKit.
 *
 *   npm run test:coverage
 *
 * Reuses the base config's webServer / baseURL, but runs only the coverage
 * collector (not the *.spec.js suite).
 */
module.exports = defineConfig({
	...base,
	testMatch: '**/coverage.collect.js',
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
