module.exports = function screenshots(webdriver, driver, shoot) {

	return [

		// shoot('intro/', function(done) {
		// 	driver.saveScreenshot('intro.png').then(done);
		// }),

		// shoot('components/bars/topbar.html', function(done) {
		// 	driver.saveScreenshot('topbar.png').then(done);
		// }),

		// shoot('components/bars/tabbar.html', function(done) {
		// 	driver.saveScreenshot('tabbar.png').then(done);
		// }),

		// shoot('components/bars/toolbar.html', function(done) {
		// 	driver.saveScreenshot('toolbar.png').then(done);
		// }),

		// shoot('components/bars/statusbar.html', function(done) {
		// 	driver.saveScreenshot('statusbar.png').then(done);
		// }),

		shoot('components/screenshots/index.html', function(done) {
			driver.saveScreenshot('components.png').then(done);
		}),

		shoot('components/screenshots/form.html', function(done) {
			driver.saveScreenshot('form.png').then(done);
		}),

		shoot('components/screenshots/aside.html', function(done) {
			driver.saveScreenshot('aside.png').then(done);
		})

	];
};
