var webdriver = require('selenium-webdriver');
var screenshots = require('./screenshots.js');
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
							console.log('  ' + chalk.cyan(url));
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
					var folder = './screenshots/' + browser.replace(' ', '-');
					var target = ensurefolder(folder + '/' + filename);
					return new Promise(function(resolve, reject) {
						driver.takeScreenshot().then(function(data) {
							fs.writeFile(target, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
								if(err) throw err;
								resolve();
							});
						});
					});
				};

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
 * Get browser name without any version number.
 * @param {string} browser
 * @returns {string}
 */
function bname(browser) {
	return browser.replace(/[0-9]/g, '').trim();
}

/**
 * Get browser version number without any name.
 * @param {string} browser
 * @returns {string}
 */
function bvers(browser) {
	var num = browser.match(/\d+/);
	return num ? num[0] : '';
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
