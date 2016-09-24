var webdriver = require('selenium-webdriver');
var screenshots = require('./screenshots.js');
var diff = require('image-diff');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');

module.exports = {

	shoot: function(options, done) {

		var sessions = options.browsers.map(function(string) {

			return function(callback) {

				Out.headline(string);
				
				var browser = new Browser(string);
				var driver = new webdriver.Builder().
					  usingServer('http://hub-cloud.browserstack.com/wd/hub').
					  withCapabilities({
					  	'browserName': browser.nickname,
						  'version': browser.versname,
						  'platform': browser.platform,
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
					var folder = options.folder + browser.fullname;
					var target = folder + '/' + File.safename(filename);
					return new Promise(function(resolve, reject) {
						Out.write(filename);
						driver.takeScreenshot().then(function(data) {
							fs.writeFile(File.ensurefolder(target), data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
								if(err) {
									throw err;
								} else if(options.compare && options.differs) {
									compare(target, resolve);
								} else {
									Out.erase().writeln(filename);
									resolve();
								}
							});
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
					if(fs.existsSync(source)) {
						diff({
							actualImage: target,
							expectedImage: source,
							diffImage: differ,
						}, function(err, similar) {
							Out.erase();
							if(err) {
								console.error(err.message);
							}
							if(similar) {
								Out.writeln(filenm, 'green');
							} else {
								Out.writeln(filenm, 'red');
							}
							resolve();
						});
					} else {
						Out.append(' (new screenshot)');
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


// Scoped ......................................................................

/**
 * Browser string breakdown.
 */
class Browser {

	constructor(string) {
		this.platform = string.split(':')[0].trim();
		this.fullname = string.split(':')[1].trim();
		this.nickname = this.fullname.replace(/[0-9]/g, '').trim();
		this.versname = (this.fullname.match(/\d+/) || [''])[0];
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
	 * @param @optional {string} color
	 * @param {string} text
	 */
	static write(text, color) {
		text = color ? chalk[color](text) : text;
		process.stdout.write('  ' + text);
	}

	/**
	 * Write line in console.
	 * @param {string} text
	 * @param @optional {string} color
	 */
	static writeln(text, color) {
		text = color ? chalk[color](text) : text;
		process.stdout.write('  ' + text + '\n');
	}

	/**
	 * Append to existing line, adding linebreak.
	 * @param @optional {string} color
	 * @param {string} text
	 */
	static appendln(text, color) {
		text = color ? chalk[color](text) : text;
		process.stdout.write('  ' + text + '\n');
	}

	/**
	 * Erase console output up to latest newline.
	 */
	static erase() {
		process.stdout.write("\r\x1b[K");
		return this;
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
		path.dirname(target).split('/').reduce((prev, path) => {
			var next = prev + path + '/';
			if (!fs.existsSync(next)){
				fs.mkdirSync(next);
			}
			return next;
		}, '');
		return target;
	}
}
