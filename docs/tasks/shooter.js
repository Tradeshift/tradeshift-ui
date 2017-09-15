const webdriver = require('selenium-webdriver');
const screenshots = require('./screenshots.js');
const diff = require('image-diff');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const stdout = process.stdout;
const URL_BROWSERCLOUD = 'http://hub-cloud.browserstack.com/wd/hub';
const URL_SCREENSHOTS = 'http://localhost:10114/dist/screenshots/';

const environment = {
	user: process.env.BROWSERSTACK_USERNAME,
	key: process.env.BROWSERSTACK_KEY
};

module.exports = {
	/**
	 * Shoot screenshots.
	 * @param {Object} options
	 * @param {function} done
	 */
	shoot: function(options, done) {
		var diffs = [];
		var sessions = options.browsers.map(function(string) {
			return function(callback) {
				Out.headline(string);
				var currenturl = null;

				var browser = new Browser(string);
				var driver = new webdriver.Builder()
					.usingServer(URL_BROWSERCLOUD)
					.withCapabilities({
						browserName: browser.nickname,
						version: browser.versname,
						platform: browser.platform,
						'browserstack.local': true,
						'browserstack.user': environment.user,
						'browserstack.key': environment.key
					})
					.build();

				// set the window size because otherwise Edge
				// would collapse it into a singularity...
				driver
					.manage()
					.window()
					.setSize(1366, 768);

				/**
				 * Create function to load a page.
				 * @param {string} url
				 * @param {function} action
				 * @returns {Promise}
				 */
				function shoot(url, action) {
					return function() {
						driver.get(`http://localhost:10114/dist/${url}`);
						return new Promise(function(resolve, reject) {
							driver
								.wait(function() {
									var readyroot = webdriver.By.css('html.ts-ready'); // not needed?
									return driver.findElements(readyroot);
								})
								.then(function() {
									currenturl = url;
									action(resolve);
								});
						});
					};
				}

				/**
				 * Create function to take a screenshot.
				 * @param {string} filename
				 * @returns {Promise}
				 */
				driver.saveScreenshot = function(filename) {
					var folder = options.folder + browser.sname;
					var target = File.safename(folder + '/' + filename);
					return new Promise(function(resolve, reject) {
						Out.write(filename);
						driver.takeScreenshot().then(function(data) {
							fs.writeFile(
								File.ensurefolder(target),
								data.replace(/^data:image\/png;base64,/, ''),
								'base64',
								function(err) {
									if (err) {
										throw err;
									} else if (options.compare && options.differs) {
										compare(target, resolve);
									} else {
										Out.erase().writeln(filename);
										resolve();
									}
								}
							);
						});
					});
				};

				/**
				 * Compare local screenshot to release screenshot.
				 * @param {string} target
				 * @param {function} resolve
				 */
				function compare(target, resolve) {
					var source = target.replace(options.folder, options.compare);
					var differ = target.replace(options.folder, options.differs);
					var filenm = path.basename(target);
					if (fs.existsSync(source)) {
						var setup = {
							url: currenturl,
							browser: browser.nickname,
							actualImage: target,
							expectedImage: source,
							diffImage: differ
						};
						diff(setup, function(err, similar) {
							Out.erase();
							if (err) {
								console.error(err.message);
							}
							if (similar) {
								Out.writeln(filenm, 'green');
							} else {
								Out.writeln(filenm, 'red');
								diffs.push(setup);
							}
							resolve();
						});
					} else {
						Out.appendln('(new screenshot)');
						resolve();
					}
				}

				/**
				 * Shoot this session.
				 * @param {Array<function>} shots
				 */
				(function nextshot(shots) {
					var next = shots.shift();
					next().then(function() {
						if (shots.length) {
							nextshot(shots);
						} else {
							callback(diffs, done);
						}
					});
				})(screenshots(webdriver, driver, shoot));
			};
		});

		/**
		 * Shoot all sessions.
		 * @param {function} done
		 */
		(function nextsession() {
			var json,
				next = sessions.shift();
			next(function nextDone_(sessionDiffs, nextDone) {
				if (sessions.length) {
					nextsession();
				} else {
					json = formatjson(sessionDiffs, options);
					fs.writeFile('screenshots/diffs.json', json, () => {
						if (options.compare) {
							Out.report(sessionDiffs.length);
						}
						nextDone();
					});
				}
			});
		})();

		/**
		 * Format JSON for smaller file size.
		 * @param {Array<Object>} diffs
		 * @param {Object} options
		 * @returns {string}
		 */
		function formatjson(diffs, options) {
			// eslint-disable-line no-shadow
			var dirty = object => !!object.diffs.length;
			var space = s => s.replace(/-/g, ' ');
			var title = s => space(path.basename(s).replace(path.extname(s), ''));
			return JSON.stringify(
				options.browsers
					.map(string => {
						var browser = new Browser(string);
						var matches = diff => diff.browser === browser.nickname; // eslint-disable-line no-shadow
						return {
							browser: browser.nicename,
							diffs: diffs.filter(matches).map(setup => {
								return [
									title(setup.actualImage),
									setup.url,
									setup.actualImage,
									setup.expectedImage,
									setup.diffImage
								];
							})
						};
					})
					.filter(dirty),
				null,
				'\t'
			);
		}
	}
};

// Scoped ......................................................................

/**
 * Browser string breakdown. Let's keep it short
 * in the Gruntfile so it's easy to comment out.
 */
class Browser {
	constructor(string) {
		this.platform = string.split(':')[0].trim();
		this.sname = string.split(':')[1].trim();
		this.nickname = this.sname.replace(/[0-9]/g, '').trim();
		this.versname = (this.sname.match(/\d+/) || [''])[0];
		this.nicename = this.sname.replace(/\w*/g, txt => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}
}

/**
 * Write stuff to console.
 */
class Out {
	/**
	 * Write headline.
	 * @param {string} header
	 */
	static headline(header) {
		console.log('\n' + header.toUpperCase());
	}

	/**
	 * Write text in console (no linebreak).
	 * @param {string} text
	 * @param @optional {string} color
	 */
	static write(text, color) {
		text = color ? chalk[color](text) : text;
		stdout.write('	' + text);
	}

	/**
	 * Write line in console.
	 * @param {string} text
	 * @param @optional {string} color
	 */
	static writeln(text, color) {
		text = color ? chalk[color](text) : text;
		stdout.write('	' + text + '\n');
	}

	/**
	 * Append to existing line, adding linebreak.
	 * @param {string} text
	 * @param @optional {string} color
	 */
	static appendln(text, color) {
		text = color ? chalk[color](text) : text;
		stdout.write('	' + text + '\n');
	}

	/**
	 * Erase console output up to latest newline.
	 * @returns {Constructor}
	 */
	static erase() {
		stdout.write('\r\x1b[K');
		return this;
	}

	/**
	 * Mission briefing.
	 * @param {number} count
	 */
	static report(count) {
		if (count) {
			console.log(`\n${count} diffs found: ${chalk.blue(URL_SCREENSHOTS)}`);
		} else {
			console.log(`\nNo diffs found. Please work harder.`);
		}
	}
}

/**
 * File system stuff.
 */
class File {
	/**
	 * Don't use spaces in filename.
	 * @param {string} filename
	 * @returns {string}
	 */
	static safename(filename) {
		return filename.replace(/ /g, '-');
	}

	/**
	 * Create folders as needed.
	 * @param {string} target
	 * @eturns {string}
	 */
	static ensurefolder(target) {
		path
			.dirname(target)
			.split('/')
			.reduce((prev, folderPath) => {
				var next = prev + folderPath + '/';
				if (!fs.existsSync(next)) {
					fs.mkdirSync(next);
				}
				return next;
			}, '');
		return target;
	}
}
