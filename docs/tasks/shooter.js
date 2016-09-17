var webdriver = require('selenium-webdriver');
var screenshots = require('./screenshots.js');
var fs = require('fs');

module.exports = {

	shoot: function(grunt, options, done) {

		//console.log(options.)

		// Input capabilities
		var capabilities = {
		  'browserName': 'firefox', 
		  'browserstack.local': true,
		  'browserstack.user': options.user,
		  'browserstack.key': options.key
		};

		var driver = new webdriver.Builder().
		  usingServer('http://hub-cloud.browserstack.com/wd/hub').
		  withCapabilities(capabilities).
		  build();

		//driver.manage().window().setSize(1300, 800);

		driver.saveScreenshot = function(filename) {
			return new Promise(function(resolve, reject) {
				filename = './screenshots/' + filename;
				driver.takeScreenshot().then(function(data) {
					fs.writeFile(filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
						if(err) throw err;
						resolve();
					});
				});
			});
		};

		/**
		 * @param {Array<function>} shots
		 */
		(function shoot(shots) {
			var next = shots.shift();
			next().then(function() {
				if(shots.length) {
					shoot(shots);
				} else {
					done();
				}
			});
		}(screenshots(webdriver, driver)));

		/*
		var driver = new webdriver.Builder().
		  usingServer('http://hub-cloud.browserstack.com/wd/hub').
		  withCapabilities(capabilities).
		  build();

		console.log('Hello Browserstack!');

		webdriver.WebDriver.prototype.saveScreenshot = function(filename) {
			return driver.takeScreenshot().then(function(data) {
				fs.writeFile(filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
					if(err) throw err;
				});
			});
		};

		var url = 'http://' + getip() + ':10114/Client-Runtime/dist/intro/';
		console.log(url);
		driver.get(url);
		//driver.findElement(webdriver.By.name('q')).sendKeys('BrowserStack');
		//driver.findElement(webdriver.By.name('btnG')).click();

		driver.getTitle().then(function(title) {
		  console.log(title);
		});

		driver.saveScreenshot('TESTING.png');
		driver.quit();
		*/
	}

};

/**
 * Dig up our network IP.
 * @returns {string}
 */
function getip() {
	var result = null;
	var ifaces = require('os').networkInterfaces();
	Object.keys(ifaces).forEach(function(dev) {
		ifaces[dev].every(function(details){
			if (details.family === 'IPv4') {
				result = details.address;
			}
			return !result;
		});
	});
	if(result === '127.0.0.1') {
		result = 'localhost'; // otherwise not work offline (?)
	}
	return result;
}