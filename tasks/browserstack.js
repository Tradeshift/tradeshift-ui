const chalk = require('chalk');
const browserStackRunner = require('browserstack-runner');
const config = require('../browserstack.json');

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
	var out = [];
	var errOut = [];

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
		browserRes.tests.forEach(function(test) {
			var timeString = ' (' + test.runtime + 'ms)';
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
					errOut.push(chalk.red(err.stack.replace('/\\n/i', '\n')));
					errOut.push('');
				});
			} else {
				out.push(chalk.green(test.suiteName + ' > ' + test.name) + timeString);
			}
		});
	});

	console.log(out.join('\n'));
	if (!errOut.length) {
		succ();
	} else {
		fail();
	}
	console.log(errOut.join('\n'));

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
