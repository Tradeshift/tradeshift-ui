const chalk = require('chalk');
const browserStackRunner = require('browserstack-runner');
const config = require('../browserstack.json');
const browsers = require('../browserstack.browsers.json');

config.browsers = browsers;

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
 * Check the report and pretty-print to the console
 * @see https://github.com/browserstack/browserstack-runner#usage-as-a-module
 * @param report BrowserStack report
 * @returns {boolean} true on success, false on failure
 */
const checkReport = function(report) {
	let out = [];
	let errOut = [];

	if (!report.length) {
		console.log('No report received, probably because the build has been terminated...');
		console.log(
			'Check the tests runs! https://travis-ci.org/Tradeshift/tradeshift-ui/pull_requests'
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

	if (err) {
		console.log('Something went wrong with BrowserStack!');
		console.log('Error:' + err);
		process.exit(2);
	}

	if (checkReport(report)) {
		process.exit(0);
	} else {
		process.exit(1);
	}
});
