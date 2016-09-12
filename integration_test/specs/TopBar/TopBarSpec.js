var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('TopBar', function likethis() {

	helper.onPage('topbar/tabs');
	it('looks great with tabs', function(done) {
		this.takeScreenshot().then(done);
	});

	helper.onPage('topbar/buttons');
	it('looks great with buttons', function(done) {
		this.takeScreenshot().then(done);
	});

});
