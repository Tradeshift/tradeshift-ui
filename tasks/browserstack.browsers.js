const bs = require('browserstack');

const browserStackCredentials = {
	username: process.env.BROWSERSTACK_USERNAME,
	password: process.env.BROWSERSTACK_KEY
};

const getRandom = max => Math.floor(Math.random() * Math.floor(max));

const getBrowserString = browser =>
	`${browser.browserName}_${browser.version}`
		.replace(/[ .]/gi, '_')
		.replace(/_0$/, '')
		.toLowerCase();

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
				return;
			}

			const { browser, browser_version } = b;

			b.browserName = b.browser;
			delete b.browser;
			b.version = b.browser_version;
			delete b.browser_version;
			delete b.real_mobile;
			delete b.device;

			if (
				browser === 'yandex' ||
				browser === 'opera' ||
				browser_version.includes('beta') ||
				browser_version.includes('Metro') ||
				(browser === 'ie' && browser_version !== '11.0')
			) {
				return;
			}

			tmpBrowsers[browser] = tmpBrowsers[browser] || {};
			tmpBrowsers[browser][browser_version] = tmpBrowsers[browser][browser_version] || [];

			tmpBrowsers[browser][browser_version].push(b);
		});
		Object.keys(tmpBrowsers).forEach(browser => {
			const tmpBrowsersArr = Object.values(tmpBrowsers[browser]);
			const latest = tmpBrowsersArr.pop();
			const previous = tmpBrowsersArr.pop();

			const latestBrowser = latest[getRandom(latest.length)];
			browsers.push(getBrowserString(latestBrowser));

			if (previous) {
				const previousBrowser = previous[getRandom(previous.length)];
				browsers.push(getBrowserString(previousBrowser));
			}
		});
		console.log(JSON.stringify(browsers, null, 2));
	});
} catch (e) {
	console.error(e);
	process.exit(1);
}
