var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('Form Errors', function() {
	helper.onPage('form/error');

	it('styles the form errors as expected', function(done) {
		this.takeScreenshot().then(done);
	});

	it('erroring text input looks as expected when focused', function(done) {
		var that = this;
		kommando.browser.findElement(By.name('text')).click()
			.then(function() {
				that.takeScreenshot().then(done);
			});
	});
});

