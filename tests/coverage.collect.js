const { test } = require('@playwright/test');

/**
 * Collects V8 coverage of the built bundle (spec/jasmine/ts.js) while the
 * Jasmine suite runs in Chromium (`npm run test:coverage`), writing a report to
 * ./coverage. Chromium only — V8 coverage isn't in Firefox/WebKit. The bundle
 * ships without source maps, so numbers map to it, not src/ files (enable them
 * on the grunt `concat` step for src-level mapping). Not named *.spec.js, so
 * only playwright.coverage.config.js runs it.
 */
test('collect V8 coverage of the Jasmine suite', async ({ page }) => {
	test.setTimeout(180 * 1000);

	await page.coverage.startJSCoverage({ resetOnNavigation: false });
	await page.goto('/index.html');
	await page.waitForFunction(
		() => window.jsApiReporter && window.jsApiReporter.status() === 'done',
		null,
		{ timeout: 150 * 1000 }
	);
	const entries = await page.coverage.stopJSCoverage();

	// Keep only the library bundle (drop jasmine, helpers, specs).
	const libEntries = entries.filter(e => (e.url || '').includes('/ts.js'));

	// Always write the raw V8 data as a fallback so you get something even if
	// the pretty reporter isn't installed / its API shifted.
	const fs = require('fs');
	fs.mkdirSync('coverage', { recursive: true });
	fs.writeFileSync('coverage/v8-raw.json', JSON.stringify(libEntries, null, 2));

	try {
		// monocart-coverage-reports turns V8 coverage into HTML + lcov.
		const { CoverageReport } = require('monocart-coverage-reports');
		const report = new CoverageReport({
			name: 'Tradeshift UI — Jasmine suite coverage',
			outputDir: './coverage',
			reports: ['v8', 'console-summary', 'lcovonly']
		});
		await report.add(libEntries);
		await report.generate();
		console.log('Coverage report written to ./coverage (open coverage/index.html)');
	} catch (e) {
		console.log(
			'Raw V8 coverage written to coverage/v8-raw.json. For an HTML report, run ' +
				'`npm i -D monocart-coverage-reports` and re-run. Reason: ' +
				e.message
		);
	}
});
