const { test, expect } = require('@playwright/test');

/**
 * Drives the whole Jasmine suite (spec/jasmine/index.html, built by
 * `grunt jasmine`) in each browser — chromium, firefox, webkit — and asserts
 * every spec passed. Jasmine exposes `jsApiReporter` on `window`, so we wait
 * for it to report `done`, then read the spec results out of the page.
 */
test('Jasmine suite passes', async ({ page }) => {
	const pageErrors = [];
	page.on('pageerror', err => pageErrors.push(String(err)));

	await page.goto('/index.html');

	// Poll from the test side rather than one long in-page wait: each evaluate is
	// a CDP round-trip that keeps the socket busy while the ~2min suite runs.
	const timeoutMs = 240 * 1000;
	const deadline = Date.now() + timeoutMs;
	let status = 'loading';
	while (status !== 'done' && Date.now() < deadline) {
		await page.waitForTimeout(2000);
		status = await page.evaluate(() =>
			window.jsApiReporter ? window.jsApiReporter.status() : 'loading'
		);
	}
	if (status !== 'done') {
		// Probe so we can tell "never loaded" from "loaded but hung".
		const probe = await page
			.evaluate(() => ({
				readyState: document.readyState,
				title: document.title,
				hasJasmine: typeof window.jasmine,
				hasReporter: typeof window.jsApiReporter,
				reporterStatus: window.jsApiReporter ? window.jsApiReporter.status() : null,
				hasTs: typeof window.ts,
				bodyLength: document.body ? document.body.innerHTML.length : -1
			}))
			.catch(e => ({ probeError: String(e) }));
		throw new Error(
			'Jasmine did not finish within ' +
				timeoutMs / 1000 +
				's (last status: ' +
				status +
				').\nPage state: ' +
				JSON.stringify(probe) +
				(pageErrors.length ? '\nPage errors:\n' + pageErrors.join('\n') : '')
		);
	}

	// Also pull runDetails: it carries SUITE-level failures (e.g. a spec file
	// throwing while registering) that truncate the run while the specs that did
	// run still "pass" — a green run that secretly skipped most of the suite.
	const { specs, runDetails } = await page.evaluate(() => ({
		specs: window.jsApiReporter.specs(),
		runDetails: window.jsApiReporter.runDetails || {}
	}));

	const failed = specs.filter(s => s.status === 'failed');
	const report = failed
		.map(s => `✗ ${s.fullName}\n` + s.failedExpectations.map(e => `      ${e.message}`).join('\n'))
		.join('\n\n');
	const loadErrors = (runDetails.failedExpectations || []).map(e => e.message).concat(pageErrors);

	// Surface what actually ran — a suspiciously low count means truncation.
	console.log(
		'Jasmine: ' +
			specs.length +
			' specs ran, overallStatus=' +
			(runDetails.overallStatus || 'unknown')
	);

	// A zero-spec run means the build didn't load (e.g. ts.js or specs.js missing).
	expect(specs.length, 'No specs ran — spec/jasmine build or library load failed.').toBeGreaterThan(
		0
	);
	// Load/page errors truncate the run silently — fail loudly even if specs passed.
	expect(
		loadErrors.length,
		'Suite load / page errors (the run may be truncated — fewer specs than expected):\n' +
			loadErrors.join('\n')
	).toBe(0);
	// Jasmine's own verdict must be a clean pass (not "incomplete" or "failed").
	expect(
		runDetails.overallStatus || 'passed',
		'Jasmine overall status was "' + runDetails.overallStatus + '" (expected "passed")'
	).toBe('passed');
	// Individual spec failures.
	expect(failed.length, failed.length + ' failing spec(s):\n\n' + report).toBe(0);
});
