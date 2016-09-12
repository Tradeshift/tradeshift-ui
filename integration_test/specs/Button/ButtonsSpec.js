var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('Buttons Menu', function() {
	helper.onPage('buttons/buttons');

	it('should look great', function(done) {
		this.takeScreenshot().then(done);
	});

	it('should assign ts-button (spirit) and ts-tertiary (classname)', function(done) {
		var path = 'menu .ts-button.ts-tertiary';
		kommando.browser.findElement(By.css(path)).then(function() {
			done();
		});
	});
});
