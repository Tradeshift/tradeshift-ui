var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('Form Textarea', function() {
	helper.onPage('form/textarea');

	it('styles the form as expected', function(done) {
		this.takeScreenshot().then(done);
	});

	it('textarea looks as expected when focused', function(done) {
		var that = this;
		kommando.browser.findElement(By.name('textarea')).click()
			.then(function() {
				that.takeScreenshot().then(done);
			}, function(err) {
				expect(err).toBe(null);
				done();
			});
	});

	var MULTILINE_TEXT = 'a\nb\nc\nd\ne\nf';
	var DELETE_KEYS = Array(MULTILINE_TEXT.length + 1).join('\b');

	it('grows with its contents', function(done) {
		var that = this;

		var errorDone = helper.errorDone(done);

		var el = kommando.browser.findElement(By.name('textarea'));
		el.click();
		el.sendKeys(MULTILINE_TEXT)
			.then(function() {
				that.takeScreenshot().then(done, errorDone);
			}, errorDone);
	});

	it('shrinks with its contents', function(done) {
		var that = this;

		var errorDone = helper.errorDone(done);

		var el = kommando.browser.findElement(By.name('textarea'));
		el.click();
		el.sendKeys(MULTILINE_TEXT);
		el.sendKeys(DELETE_KEYS)
			.then(function() {
				that.takeScreenshot().then(done, errorDone);
			}, errorDone);
	});
});
