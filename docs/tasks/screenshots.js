module.exports = function screenshots(webdriver, driver) {

	/**
	 * @param {string} url
	 * @param {function} action
	 */
	function shoot(url, action) {
		return function() {
			driver.get(`http://localhost:10114/dist/${url}`);
			return new Promise(function(resolve, reject) {
				console.log(`Shooting ${url}...`);
				driver.wait(function() {
					var readyroot = webdriver.By.css('html.ts-ready');
				  return driver.findElements(readyroot);
				}).then(function() {
					action(resolve);
				});
			});
		};
	}

	return [

		shoot('intro/', function(done) {
			driver.saveScreenshot('intro.png').then(done);
		}),

		shoot('components/bars/topbar.html', function(done) {
			driver.saveScreenshot('topbar.png').then(done);
		}),

		shoot('components/bars/tabbar.html', function(done) {
			driver.saveScreenshot('tabbar.png').then(done);
		}),

		shoot('components/bars/toolbar.html', function(done) {
			driver.saveScreenshot('toolbar.png').then(done);
		}),

		shoot('components/bars/statusbar.html', function(done) {
			driver.saveScreenshot('statusbar.png').then(done);
		})

	];
};