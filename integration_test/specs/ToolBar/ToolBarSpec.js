var helper = require('../../lib/helper');
var By = kommando.webdriver.By;

describe('ToolBar', function likethis() {
	helper.onPage('toolbar/toolbar');
	it('looks great', function(done) {
		this.takeScreenshot().then(done);
	});
});
