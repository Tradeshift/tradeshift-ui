var helper = require('../lib/helper');
var wait = require('../lib/wait');
var asides = require('../lib/helpers/asides');
var By = kommando.webdriver.By;

describe('Asides', function() {
	helper.onPage('asides');

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

	function thirdAside() {
		return kommando.browser.findElement({
			id: 'third'
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

	function thirdOpener() {
		return kommando.browser.findElement({
			id: 'third_opener'
		});
	}

	it('opens the first aside', function(done) {
		var that = this;
		firstOpener().click();
		wait.forElement({ id: 'first-marker' }).then(function() {
			that.takeScreenshot().then(done, helper.errorDone(done));
		});
	});

	it('opens the second aside', function(done) {
		var that = this;
		firstOpener().click();
		wait.forElement({ id: 'first-marker' });
		secondOpener().click();
		wait.forElement({ id: 'second-marker' })
			.then(function() {
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
	});

	it('opens the third aside', function(done) {
		var that = this;
		firstOpener().click();
		wait.forElement({ id: 'first-marker' });
		secondOpener().click();
		wait.forElement({ id: 'second-marker' });
		thirdOpener().click();
		wait.forElement({ id: 'third-marker' })
			.then(function() {
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
	});

	describe('clicking the X', function() {
		it('closes a single aside and removes the cover', function(done) {
			var that = this;
			firstOpener().click();
			var firstLocator = { id: 'first-marker' };
			wait.forElement(firstLocator);
			asides.getClosingButton('#first').click();
			wait.forNoElement(firstLocator);
			wait.forHidden(asides.COVER_LOCATOR).then(function() {
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
		});

		it('closes only the second aside and leaves the cover', function(done) {
			var that = this;
			var firstLocator = { id: 'first-marker' };
			var secondLocator = { id: 'second-marker' };

			firstOpener().click();
			wait.forElement(firstLocator);
			secondOpener().click();
			wait.forElement(secondLocator);

			asides.getClosingButton('#second').click();

			wait.forNoElement(secondLocator);
			wait.forElement(firstLocator);

			asides.getCover().isDisplayed().then(function(displayed) {
				expect(displayed).toBe(true);
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
		});

		it('closes only the third aside and leaves the cover', function(done) {
			var that = this;
			var firstLocator = { id: 'first-marker' };
			var secondLocator = { id: 'second-marker' };
			var thirdLocator = { id: 'third-marker' };

			firstOpener().click();
			wait.forElement(firstLocator);
			secondOpener().click();
			wait.forElement(secondLocator);
			thirdOpener().click();
			wait.forElement(thirdLocator);

			asides.getClosingButton('#third').click();

			wait.forNoElement(thirdLocator);
			wait.forElement(firstLocator);
			wait.forElement(secondLocator);

			asides.getCover().isDisplayed().then(function(displayed) {
				expect(displayed).toBe(true);
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
		});
	});

	describe('clicking the background', function() {
		it('closes a single aside', function(done) {
			var that = this;

			var firstLocator = { id: 'first-marker' };

			firstOpener().click();
			wait.forElement(firstLocator);

			asides.getCover().click();

			wait.forNoElement(firstLocator).then(function() {
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
		});

		it('closes two asides', function(done) {
			var that = this;
			var firstLocator = { id: 'first-marker' };
			var secondLocator = { id: 'second-marker' };

			firstOpener().click();
			wait.forElement(firstLocator);
			secondOpener().click();
			wait.forElement(secondLocator);

			asides.getCover().click();

			wait.forNoElement(firstLocator);
			wait.forNoElement(secondLocator).then(function() {
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
		});

		it('closes three asides', function(done) {
			var that = this;
			var firstLocator = { id: 'first-marker' };
			var secondLocator = { id: 'second-marker' };
			var thirdLocator = { id: 'third-marker' };

			firstOpener().click();
			wait.forElement(firstLocator);
			secondOpener().click();
			wait.forElement(secondLocator);
			thirdOpener().click();
			wait.forElement(thirdLocator);

			asides.getCover().click();
			wait.forNoElement(firstLocator);
			wait.forNoElement(secondLocator);
			wait.forNoElement(thirdLocator).then(function() {
				that.takeScreenshot().then(done, helper.errorDone(done));
			});
		});
	});
});
