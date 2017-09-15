module.exports = function screenshots(webdriver, driver, shoot) {
	return [
		shoot('screenshots/pages/asides.html', function(done) {
			setTimeout(function waitforaside() {
				driver.saveScreenshot('asides.png').then(done);
			}, 2000);
		}),

		shoot('screenshots/pages/bars.html', function(done) {
			driver.saveScreenshot('bars.png').then(done);
		}),

		shoot('screenshots/pages/buttons.html', function(done) {
			driver.saveScreenshot('buttons.png').then(done);
		}),

		shoot('screenshots/pages/forms.html', function(done) {
			driver.saveScreenshot('forms.png').then(done);
		}),

		shoot('screenshots/pages/panels.html', function(done) {
			setTimeout(function waitforaside() {
				driver.saveScreenshot('panels.png').then(done);
			}, 2000);
		})
	];
};
