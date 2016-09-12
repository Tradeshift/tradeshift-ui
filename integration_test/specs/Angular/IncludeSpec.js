var helper = require('../../lib/helper');
var wait = require('../../lib/wait');
var By = kommando.webdriver.By;

describe('NG Include', function() {
	helper.onPage('angular/ng-include');

	it('should spiritualize inputs', function(done) {
		var that = this;

		wait.forElement(By.id('ready-marker'));

		kommando.browser.findElements(By.css('.ts-main .ts-button'))
			.then(function(buttons) {
				expect(buttons.length).toBe(3);
				that.takeScreenshot().then(done);
			}, function(err) {
				expect(err).toBe(null);
				done();
			});
	});
});
