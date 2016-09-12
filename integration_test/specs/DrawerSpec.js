var helper = require('../lib/helper');
var wait = require('../lib/wait');
var asides = require('../lib/helpers/asides');
var By = kommando.webdriver.By;

describe('Drawers', function() {
	helper.onPage('drawers');

	function firstAside() {
		return kommando.browser.findElement({
			id: 'first'
		});
	}

	function secondAside() {
		return kommando.browser.findElement({
			id: 'second'
		});
	}

	function firstOpener() {
		return kommando.browser.findElement({
			id: 'first_opener'
		});
	}

	function secondOpener() {
		return kommando.browser.findElement({
			id: 'second_opener'
		});
	}

	it('opens the first nested aside', function(done) {
		var that = this;
		firstOpener().click();
		wait.forElement({ id: 'first-marker' }).then(function() {
			that.takeScreenshot().then(done, helper.errorDone(done));
		});
	});

	it('opens the second nested aside', function(done) {
		var that = this;
		firstOpener().click();
		wait.forElement({ id: 'first-marker' });
		secondOpener().click();
		wait.forElement({ id: 'second-marker' })
			.then(function() {
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
	});

});
