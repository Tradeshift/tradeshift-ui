const chalk = require('chalk');
const browserstackRunner = require('browserstack-runner');

const config = require('../browserstack.json');

const parseBrowserStackJSON = function(json) {
	var out = [];
	var errOut = [];
	out.push('');
	out.push('');
	json.forEach(function(browserRes) {
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
	if (errOut.length) {
		fail();
	} else {
		succ();
	}
	console.log(errOut.join('\n'));

	return !errOut.length;
};

global.logLevel = 0;

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
};

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
};
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
};

tsui();
brst();
runr();

browserstackRunner.run(config, function(error, report) {
	global.logLevel = 6;
	if (error) {
		console.log('Something went wrong with BrowserStack!');
		console.log('Error:' + error);
		process.exit(2);
	}

	if (parseBrowserStackJSON(report)) {
		process.exit(0);
	} else {
		process.exit(1);
	}
});
