var webdriver = require('selenium-webdriver');
var screenshots = require('./screenshots.js');
var diff = require('image-diff');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');

module.exports = {

	shoot: function(options, done) {

		var sessions = options.browsers.map(function(browser) {

			return function(callback) {

				console.log('\n' + browser.toUpperCase());

				var driver = new webdriver.Builder().
					  usingServer('http://hub-cloud.browserstack.com/wd/hub').
					  withCapabilities({
					  	'browserName': bname(browser),
						  'version': bvers(browser),
						  'platform': bos(browser),
						  'browserstack.local': true,
						  'browserstack.user': options.user,
						  'browserstack.key': options.key
					  }).build();

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
							driver.wait(function() {
								var readyroot = webdriver.By.css('html.ts-ready'); // not needed?
							  return driver.findElements(readyroot);
							}).then(function() {
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
					var folder = options.folder + bfull(browser);
					var target = ensurefolder(safename(folder + '/' + filename));
					return new Promise(function(resolve, reject) {
						write(filename);
						driver.takeScreenshot().then(function(data) {
							fs.writeFile(target, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
								if(err) {
									throw err;
								} else if(options.compare) {
									var source = target.replace(options.folder, options.compare);
									compare(target, source, filename, resolve);
								} else {
									erase();
									writeln(filename);
									resolve();
								}
							});
						});
					});
				};

				function compare(localsrc, releasesrc, filename, resolve) {
					diff({
						actualImage: localsrc,
						expectedImage: releasesrc,	
					}, function(err, similar) {
						erase();
						if(err) {
							console.error(err.message);
						}
						if(similar) {
							writeln(filename, 'green');
						} else {
							writeln(filename, 'red');
						}
						resolve();
					});
				}

				/**
				 * Shoot this session.
				 * @param {Array<function>} shots
				 */
				(function nextshot(shots) {
					var next = shots.shift();	
					next().then(function() {
						if(shots.length) { // shoot next screenshot
							nextshot(shots);
						} else {
							callback(done);
						}
					});
				}(screenshots(webdriver, driver, shoot)));

			};

		});

		/**
		 * Shoot all sessions.
		 * @param {function} done
		 */
		(function nextsession() {
			var next = sessions.shift();
			next(function done(done) {
				if(sessions.length) {
					nextsession();
				} else {
					done();
				}
			});
		}());
	}

};

/**
 * Get browser operating system.
 * @param {string} browser
 * @returns {string}
 */
function bos(browser) {
	return browser.split(':')[0].trim();
}

/**
 * Get browser name without any version number.
 * @param {string} browser
 * @returns {string}
 */
function bname(browser) {
	return bfull(browser).replace(/[0-9]/g, '').trim();
}

/**
 * Get browser version number without any name.
 * @param {string} browser
 * @returns {string}
 */
function bvers(browser) {
	var num = bfull(browser).match(/\d+/);
	return num ? num[0] : '';
}

/**
 * Get browser name and version (without OS).
 * @param {string} browser
 * @returns {string}
 */
function bfull(browser) {
	return browser.split(':')[1].trim();
}

/**
 * Don't use spaces in filename.
 * @param {string} filename
 * @returns {string}
 */
function safename(filename) {
	return filename.replace(/ /g, '-');
}

/**
 * Write text in console (no linebreak).
 * @param @optional {string} color
 * @param {string} text
 */
function write(text, color) {
	text = color ? chalk[color](text) : text;
	process.stdout.write('  ' + text);
}

/**
 * Write line in console.
 * @param {string} text
 * @param @optional {string} color
 */
function writeln(text, color) {
	text = color ? chalk[color](text) : text;
	process.stdout.write('  ' + text + '\n');
}

/**
 * Erase console output up to latest newline.
 */
function erase() {
	process.stdout.write("\r\x1b[K");
}

/**
 * Create folders as needed.
 * @param {string} target
 * @eturns {string}
 */
function ensurefolder(target) {
	path.dirname(target).split('/').reduce((prev, path) => {
		var next = prev + path + '/';
		if (!fs.existsSync(next)){
			fs.mkdirSync(next);
		}
		return next;
	}, '');
	return target;
}
