var helper = require('../../lib/helper');
var wait = require('../../lib/wait');
var By = kommando.webdriver.By;

describe('NG Repeat', function() {
	helper.onPage('angular/ng-repeat');

	it('should spiritualize inputs', function(done) {
		var that = this;

		wait.forElement(By.id('ready-marker'));

		kommando.browser.findElements(By.className('ts-input')).then(
			function (inputs) {
				expect(inputs.length).toBe(6);
				that.takeScreenshot().then(done);
			},
			function (err) {
				expect(23).toBe('nice');
				done();
			}
		);
	});
});
