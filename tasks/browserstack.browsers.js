const bs = require('browserstack');

const browserStackCredentials = {
	username: process.env.BROWSERSTACK_USERNAME,
	password: process.env.BROWSERSTACK_KEY
};

// Only these browsers are supported by the BrowserStack Worker API v4 for
// JavaScript Testing and were in the original browserstack.json. The
// JavaScript Testing getBrowsers() API can return additional browsers (new
// additions, regional variants, etc.) that the Worker API rejects — the
// explicit allowlist prevents those 2 extra entries from slipping through
// and causing "Validation Failed - `browser` invalid" errors.
const ALLOWED_BROWSERS = new Set(['chrome', 'firefox', 'safari', 'edge', 'ie']);

// Output complete browser objects (not strings) so configParser.populateOsAndOsVersion
// hits its early-return path at line 51 ("if browserObject.os && browserObject.os_version")
// and never enters the filteredBrowsers lookup. That lookup uses strict browser === browser
// equality (not case-insensitive like setBrowserVersion does), and returns undefined when
// entries are missing or casing mismatches — crashing at configParser.js:71 or cli.js:400.
// Providing os + os_version upfront avoids all of that entirely.

try {
	const bsClient = bs.createClient(browserStackCredentials);
	const browsers = [];
	const tmpBrowsers = {};

	bsClient.getBrowsers((error, allBrowsers) => {
		if (error) {
			throw new Error(error);
		}

		allBrowsers.forEach(b => {
			if (b.device) {
				return; // skip mobile/device entries
			}

			const browserLower = (b.browser || '').toLowerCase();
			const browser_version = b.browser_version;

			if (
				!browserLower ||
				!browser_version ||
				!ALLOWED_BROWSERS.has(browserLower) || // skip anything not in the allowlist
				browser_version.includes('beta') ||
				browser_version.includes('Metro') ||
				(browserLower === 'ie' && browser_version !== '11.0')
			) {
				return;
			}

			tmpBrowsers[browserLower] = tmpBrowsers[browserLower] || {};
			tmpBrowsers[browserLower][browser_version] = tmpBrowsers[browserLower][browser_version] || [];
			tmpBrowsers[browserLower][browser_version].push(b);
		});

		Object.keys(tmpBrowsers).forEach(browser => {
			// Sort versions ascending so the highest is last.
			const sortedVersions = Object.keys(tmpBrowsers[browser]).sort(
				(a, b) => parseFloat(a) - parseFloat(b)
			);

			// Test the two most recent settled versions, skipping the newest release:
			// brand-new browser/OS builds provision slowly and behave inconsistently on
			// BrowserStack. Browsers with fewer than three versions are kept as-is.
			const stableVersions =
				sortedVersions.length > 2 ? sortedVersions.slice(0, -1) : sortedVersions;
			const latestVersion = stableVersions[stableVersions.length - 1];
			const previousVersion = stableVersions[stableVersions.length - 2];

			// Build a complete browser object from the API data for a given version.
			// - browser is lowercased: the v4 Worker API expects lowercase names
			//   (the original string approach sent "chrome", not "Chrome")
			// - os + os_version come from the API entry, pinned to Windows 10 when
			//   available for a stable image; multi-OS browsers fall back to any
			//   Windows entry, and Safari (OS X only) falls back to the first entry
			const makeEntry = ver => {
				const entries = tmpBrowsers[browser][ver];
				const entry =
					entries.find(e => e.os === 'Windows' && e.os_version === '10') ||
					entries.find(e => e.os === 'Windows') ||
					entries[0];
				return {
					browser: browser,
					browser_version: entry.browser_version,
					os: entry.os,
					os_version: entry.os_version
				};
			};

			browsers.push(makeEntry(latestVersion));
			if (previousVersion !== undefined) {
				browsers.push(makeEntry(previousVersion));
			}
		});

		console.log(JSON.stringify(browsers, null, 2));
	});
} catch (e) {
	console.error(e);
	process.exit(1);
}
