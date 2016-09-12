var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('Form Number Input', function() {
	helper.onPage('form/number');

	it('styles the form as expected', function(done) {
		this.takeScreenshot().then(done);
	});

	it('number input looks as expected when focused', function(done) {
		var that = this;
		kommando.browser.findElement(By.name('number')).click()
			.then(function() {
				that.takeScreenshot().then(done);
			}, function(err) {
				expect(err).toBe(null);
				done();
			});
	});
});
