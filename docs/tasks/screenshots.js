module.exports = function screenshots(webdriver, driver, shoot) {
	return [

		shoot('components/screenshots/buttons.html', function(done) {
			driver.saveScreenshot('buttons.png').then(done);
		}),

		shoot('components/screenshots/forms.html', function(done) {
			driver.saveScreenshot('forms.png').then(done);
		}),

		shoot('components/screenshots/asides.html', function(done) {
			driver.saveScreenshot('aside.png').then(done);
		}),

		shoot('components/screenshots/bars.html', function(done) {
			driver.saveScreenshot('bars.png').then(done);
		}),

		shoot('components/screenshots/panels.html', function(done) {
			driver.saveScreenshot('panels.png').then(done);
		})

	];
};
