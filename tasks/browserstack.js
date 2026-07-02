const chalk = require('chalk');
const browserStackRunner = require('browserstack-runner');
const config = require('../browserstack.json');
const browsers = require('../browserstack.browsers.json');

config.browsers = browsers;

/**
 * The runner's own display-name builder, so report entries can be matched
 * back to the browsers we asked for. Internal lib path, hence the guard —
 * if it moves in a future version we fall back to comparing counts only.
 */
let browserString = null;
try {
	browserString = require('browserstack-runner/lib/utils').browserString;
} catch (e) {
	console.log('Could not load browserstack-runner/lib/utils, missing-browser check degraded.');
}

/**
 * FigletJS ASCII ART
 * Font: Bloddy
 * Text: "Tradeshift UI"
 * @see http://patorjk.com/software/taag/#p=display&f=Bloody&t=Tradeshift%20UI
 */
const tsui = function() {
	console.log(
		'            ▄▄▄█████▓ ██▀███   ▄▄▄      ▓█████▄ ▓█████   ██████  ██░ ██  ██▓  █████▒▄▄▄█████▓    █    ██  ██▓'
	);
	console.log(
		'            ▓  ██▒ ▓▒▓██ ▒ ██▒▒████▄    ▒██▀ ██▌▓█   ▀ ▒██    ▒ ▓██░ ██▒▓██▒▓██   ▒ ▓  ██▒ ▓▒    ██  ▓██▒▓██▒'
	);
	console.log(
		'            ▒ ▓██░ ▒░▓██ ░▄█ ▒▒██  ▀█▄  ░██   █▌▒███   ░ ▓██▄   ▒██▀▀██░▒██▒▒████ ░ ▒ ▓██░ ▒░   ▓██  ▒██░▒██▒'
	);
	console.log(
		'            ░ ▓██▓ ░ ▒██▀▀█▄  ░██▄▄▄▄██ ░▓█▄   ▌▒▓█  ▄   ▒   ██▒░▓█ ░██ ░██░░▓█▒  ░ ░ ▓██▓ ░    ▓▓█  ░██░░██░'
	);
	console.log(
		'            ▒██▒ ░ ░██▓ ▒██▒ ▓█   ▓██▒░▒████▓ ░▒████▒▒██████▒▒░▓█▒░██▓░██░░▒█░      ▒██▒ ░    ▒▒█████▓ ░██░'
	);
	console.log(
		'            ▒ ░░   ░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒▒▓  ▒ ░░ ▒░ ░▒ ▒▓▒ ▒ ░ ▒ ░░▒░▒░▓   ▒ ░      ▒ ░░      ░▒▓▒ ▒ ▒ ░▓'
	);
	console.log(
		'            ░      ░▒ ░ ▒░  ▒   ▒▒ ░ ░ ▒  ▒  ░ ░  ░░ ░▒  ░ ░ ▒ ░▒░ ░ ▒ ░ ░          ░       ░░▒░ ░ ░  ▒ ░'
	);
	console.log(
		'            ░        ░░   ░   ░   ▒    ░ ░  ░    ░   ░  ░  ░   ░  ░░ ░ ▒ ░ ░ ░      ░          ░░░ ░ ░  ▒ ░'
	);
	console.log(
		'            ░           ░  ░   ░       ░  ░      ░   ░  ░  ░ ░                         ░      ░'
	);
	console.log('            ░');
};

/**
 * FigletJS ASCII ART
 * Font: Bloddy
 * Text: "BrowserStack"
 * @see http://patorjk.com/software/taag/#p=display&f=Bloody&t=BrowserStack
 */
const brst = function() {
	console.log(
		'         ▄▄▄▄    ██▀███   ▒█████   █     █░  ██████ ▓█████  ██▀███    ██████ ▄▄▄█████▓ ▄▄▄       ▄████▄   ██ ▄█▀'
	);
	console.log(
		'         ▓█████▄ ▓██ ▒ ██▒▒██▒  ██▒▓█░ █ ░█░▒██    ▒ ▓█   ▀ ▓██ ▒ ██▒▒██    ▒ ▓  ██▒ ▓▒▒████▄    ▒██▀ ▀█   ██▄█▒'
	);
	console.log(
		'         ▒██▒ ▄██▓██ ░▄█ ▒▒██░  ██▒▒█░ █ ░█ ░ ▓██▄   ▒███   ▓██ ░▄█ ▒░ ▓██▄   ▒ ▓██░ ▒░▒██  ▀█▄  ▒▓█    ▄ ▓███▄░'
	);
	console.log(
		'         ▒██░█▀  ▒██▀▀█▄  ▒██   ██░░█░ █ ░█   ▒   ██▒▒▓█  ▄ ▒██▀▀█▄    ▒   ██▒░ ▓██▓ ░ ░██▄▄▄▄██ ▒▓▓▄ ▄██▒▓██ █▄'
	);
	console.log(
		'         ░▓█  ▀█▓░██▓ ▒██▒░ ████▓▒░░░██▒██▓ ▒██████▒▒░▒████▒░██▓ ▒██▒▒██████▒▒  ▒██▒ ░  ▓█   ▓██▒▒ ▓███▀ ░▒██▒ █▄'
	);
	console.log(
		'         ░▒▓███▀▒░ ▒▓ ░▒▓░░ ▒░▒░▒░ ░ ▓░▒ ▒  ▒ ▒▓▒ ▒ ░░░ ▒░ ░░ ▒▓ ░▒▓░▒ ▒▓▒ ▒ ░  ▒ ░░    ▒▒   ▓▒█░░ ░▒ ▒  ░▒ ▒▒ ▓▒'
	);
	console.log(
		'         ▒░▒   ░   ░▒ ░ ▒░  ░ ▒ ▒░   ▒ ░ ░  ░ ░▒  ░ ░ ░ ░  ░  ░▒ ░ ▒░░ ░▒  ░ ░    ░      ▒   ▒▒ ░  ░  ▒   ░ ░▒ ▒░'
	);
	console.log(
		'         ░    ░   ░░   ░ ░ ░ ░ ▒    ░   ░  ░  ░  ░     ░     ░░   ░ ░  ░  ░    ░        ░   ▒   ░        ░ ░░ ░'
	);
	console.log(
		'         ░         ░         ░ ░      ░          ░     ░  ░   ░           ░                 ░  ░░ ░      ░  ░'
	);
	console.log(
		'         ░                                                                                 ░'
	);
};

/**
 * FigletJS ASCII ART
 * Font: Bloddy
 * Text: "Runner"
 * @see http://patorjk.com/software/taag/#p=display&f=Bloody&t=Runner
 */
const runr = function() {
	console.log(
		'                                  ██▀███   █    ██  ███▄    █  ███▄    █ ▓█████  ██▀███'
	);
	console.log(
		'                                  ▓██ ▒ ██▒ ██  ▓██▒ ██ ▀█   █  ██ ▀█   █ ▓█   ▀ ▓██ ▒ ██▒'
	);
	console.log(
		'                                  ▓██ ░▄█ ▒▓██  ▒██░▓██  ▀█ ██▒▓██  ▀█ ██▒▒███   ▓██ ░▄█ ▒'
	);
	console.log(
		'                                  ▒██▀▀█▄  ▓▓█  ░██░▓██▒  ▐▌██▒▓██▒  ▐▌██▒▒▓█  ▄ ▒██▀▀█▄'
	);
	console.log(
		'                                  ░██▓ ▒██▒▒▒█████▓ ▒██░   ▓██░▒██░   ▓██░░▒████▒░██▓ ▒██▒'
	);
	console.log(
		'                                  ░ ▒▓ ░▒▓░░▒▓▒ ▒ ▒ ░ ▒░   ▒ ▒ ░ ▒░   ▒ ▒ ░░ ▒░ ░░ ▒▓ ░▒▓░'
	);
	console.log(
		'                                  ░▒ ░ ▒░░░▒░ ░ ░ ░ ░░   ░ ▒░░ ░░   ░ ▒░ ░ ░  ░  ░▒ ░ ▒░'
	);
	console.log(
		'                                  ░░   ░  ░░░ ░ ░    ░   ░ ░    ░   ░ ░    ░     ░░   ░'
	);
	console.log('                                  ░        ░              ░          ░    ░  ░   ░');
	console.log('');
};

/**
 * FigletJS ASCII ART
 * Font: Bloddy
 * Text: "Failure"
 * @see http://patorjk.com/software/taag/#p=display&f=Bloody&t=Failure
 */
const fail = function() {
	console.log(
		'                               █████▒▄▄▄       ██▓ ██▓     █    ██  ██▀███  ▓█████  ▐██▌'
	);
	console.log(
		'                               ▓██   ▒▒████▄    ▓██▒▓██▒     ██  ▓██▒▓██ ▒ ██▒▓█   ▀  ▐██▌'
	);
	console.log(
		'                               ▒████ ░▒██  ▀█▄  ▒██▒▒██░    ▓██  ▒██░▓██ ░▄█ ▒▒███    ▐██▌'
	);
	console.log(
		'                               ░▓█▒  ░░██▄▄▄▄██ ░██░▒██░    ▓▓█  ░██░▒██▀▀█▄  ▒▓█  ▄  ▓██▒'
	);
	console.log(
		'                               ░▒█░    ▓█   ▓██▒░██░░██████▒▒▒█████▓ ░██▓ ▒██▒░▒████▒ ▒▄▄'
	);
	console.log(
		'                               ▒ ░    ▒▒   ▓▒█░░▓  ░ ▒░▓  ░░▒▓▒ ▒ ▒ ░ ▒▓ ░▒▓░░░ ▒░ ░ ░▀▀▒'
	);
	console.log(
		'                               ░       ▒   ▒▒ ░ ▒ ░░ ░ ▒  ░░░▒░ ░ ░   ░▒ ░ ▒░ ░ ░  ░ ░  ░'
	);
	console.log(
		'                               ░ ░     ░   ▒    ▒ ░  ░ ░    ░░░ ░ ░   ░░   ░    ░       ░'
	);
	console.log('                               ░  ░ ░      ░  ░   ░        ░        ░  ░ ░');
	console.log('');
};

/**
 * FigletJS ASCII ART
 * Font: Bloddy
 * Text: "Success"
 * @see http://patorjk.com/software/taag/#p=display&f=Bloody&t=Success
 */
const succ = function() {
	console.log(
		'                             ██████  █    ██  ▄████▄   ▄████▄  ▓█████   ██████   ██████  ▐██▌'
	);
	console.log(
		'                             ▒██    ▒  ██  ▓██▒▒██▀ ▀█  ▒██▀ ▀█  ▓█   ▀ ▒██    ▒ ▒██    ▒  ▐██▌'
	);
	console.log(
		'                             ░ ▓██▄   ▓██  ▒██░▒▓█    ▄ ▒▓█    ▄ ▒███   ░ ▓██▄   ░ ▓██▄    ▐██▌'
	);
	console.log(
		'                             ▒   ██▒▓▓█  ░██░▒▓▓▄ ▄██▒▒▓▓▄ ▄██▒▒▓█  ▄   ▒   ██▒  ▒   ██▒ ▓██▒'
	);
	console.log(
		'                             ▒██████▒▒▒▒█████▓ ▒ ▓███▀ ░▒ ▓███▀ ░░▒████▒▒██████▒▒▒██████▒▒ ▒▄▄'
	);
	console.log(
		'                             ▒ ▒▓▒ ▒ ░░▒▓▒ ▒ ▒ ░ ░▒ ▒  ░░ ░▒ ▒  ░░░ ▒░ ░▒ ▒▓▒ ▒ ░▒ ▒▓▒ ▒ ░ ░▀▀▒'
	);
	console.log(
		'                             ░ ░▒  ░ ░░░▒░ ░ ░   ░  ▒     ░  ▒    ░ ░  ░░ ░▒  ░ ░░ ░▒  ░ ░ ░  ░'
	);
	console.log(
		'                             ░  ░  ░   ░░░ ░ ░ ░        ░           ░   ░  ░  ░  ░  ░  ░      ░'
	);
	console.log(
		'                             ░     ░     ░ ░      ░ ░         ░  ░      ░        ░   ░'
	);
	console.log('                             ░        ░');
	console.log('');
};

/**
 * A worker that times out (or dies) never posts results, so it is simply
 * absent from the report — without this check such a run would pass as
 * long as the browsers that DID respond were green.
 * @param report BrowserStack report
 * @returns {Array<string>} display names of browsers missing from the report
 */
const findMissingBrowsers = function(report) {
	const reported = report.map(res => res.browser);
	if (browserString) {
		return config.browsers.map(b => browserString(b)).filter(b => !reported.includes(b));
	}
	if (reported.length < config.browsers.length) {
		return [config.browsers.length - reported.length + ' browser(s) (names unavailable)'];
	}
	return [];
};

/**
 * Check the report and pretty-print to the console
 * @see https://github.com/browserstack/browserstack-runner#usage-as-a-module
 * @param report BrowserStack report
 * @returns {boolean} true on success, false on failure
 */
const checkReport = function(report) {
	const out = [];
	const errOut = [];
	const missing = findMissingBrowsers(report);

	if (!report.length && !missing.length) {
		console.log('No report received, probably because the build has been terminated...');
		console.log(
			'Check the test runs! https://automate.browserstack.com/ and the GitHub Actions log.'
		);
		fail();
		return false;
	}

	out.push('');
	out.push('');
	report.forEach(function(browserRes) {
		out.push('____________________________________________________________');
		out.push(chalk.white.bgBlack('Browser: ') + chalk.white.bold.bgBlack(browserRes.browser));
		if (browserRes.tests && browserRes.tests.length) {
			browserRes.tests.forEach(function(test) {
				let timeString = ' (' + test.runtime + 'ms)';
				if (test.runtime > 500) {
					timeString = chalk.red(timeString);
				} else if (test.runtime < 100) {
					timeString = chalk.green(timeString);
				}

				if (test.status === 'failed') {
					out.push(chalk.red(test.suiteName + ' > ' + test.name) + timeString);

					errOut.push('');
					errOut.push('Browser: ' + chalk.red.bold(browserRes.browser));
					errOut.push(chalk.white.bgRed.bold(test.suiteName + ' > ' + test.name));
					test.errors.forEach(function(err) {
						if (err.stack) {
							errOut.push(chalk.red(err.stack.replace('/\\n/i', '\n')));
						} else {
							errOut.push(chalk.red('No stacktrace supplied :('));
						}
						errOut.push('');
					});
				} else {
					out.push(chalk.green(test.suiteName + ' > ' + test.name) + timeString);
				}
			});
		} else {
			errOut.push('');
			errOut.push('Browser: ' + chalk.red.bold(browserRes.browser));
			errOut.push(chalk.white.bgRed.bold('No tests ran, something went horribly wrong!'));
			out.push(chalk.white.bgRed.bold('No tests ran, something went horribly wrong!'));
		}
	});

	missing.forEach(function(browser) {
		errOut.push('');
		errOut.push('Browser: ' + chalk.red.bold(browser));
		errOut.push(chalk.white.bgRed.bold('No results reported — worker timed out or died!'));
		out.push(chalk.white.bgRed.bold('Missing from report: ' + browser));
	});

	out.forEach(line => console.log(line));
	if (!errOut.length) {
		succ();
	} else {
		fail();
	}
	errOut.forEach(line => console.log(line));

	return !errOut.length;
};

browserStackRunner.run(config, function(err, report) {
	tsui();
	brst();
	runr();

	if (err && err.name !== 'TestsFailedError') {
		// Hard infrastructure failure (tunnel down, API unreachable, bad config).
		// TestsFailedError is the runner counting browser timeouts as failures —
		// those are checked via the report below, not treated as a build error.
		console.log('Something went wrong with BrowserStack!');
		console.log('Error:' + err);
		process.exit(2);
	}

	// on worker-timeout the runner reports `{}` instead of an array
	if (checkReport(Array.isArray(report) ? report : [])) {
		process.exit(0);
	} else {
		process.exit(1);
	}
});
