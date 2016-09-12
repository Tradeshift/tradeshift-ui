var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('Form', function() {
	helper.onPage('form/form');

	it('styles the form as expected', function(done) {
		this.takeScreenshot().then(done);
	});
});
