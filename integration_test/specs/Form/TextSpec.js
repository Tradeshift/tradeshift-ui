var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('Form Text Inputs', function() {
	helper.onPage('form/text');

	it('look proper', function(done) {
		this.takeScreenshot().then(done);
	});

	it('looks as expected when focused', function(done) {
		var that = this;
		kommando.browser.findElement(By.name('text')).click()
			.then(function() {
				that.takeScreenshot().then(done);
			});
	});
});
