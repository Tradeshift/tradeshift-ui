/*global kommando*/

/**
 * Selenium Helpers for waiting
 *
 * Newer version of webdriver have an until library, but these will do for now.
 *
 * They depend on kommando being in the global scope, and use the current
 * instantiated webdriver attached to kommando.
 */

var wait = module.exports;

function negate(promise) {
	return promise.then(function(v) { return !v; })	;
}

function untilElementPresent(locator) {
	return function() {
		return kommando.browser.isElementPresent(locator);
	};
}

function untilElementEnabled(locator) {
	return function() {
		return kommando.browser.findElement(locator).isEnabled();
	};
}

var WAIT_AMOUNT = 100000;

wait.forElement = function(locator) {
	kommando.browser.wait(untilElementPresent(locator), WAIT_AMOUNT);
	return kommando.browser.wait(untilElementEnabled(locator), WAIT_AMOUNT);
};

wait.forHidden = function(locator) {
	return kommando.browser.wait(function() {
		return negate(kommando.browser.findElement(locator).isDisplayed());
	});
};

wait.forNoElement = function(locator) {
	return kommando.browser.wait(function() {
		return negate(kommando.browser.isElementPresent(locator));
	}, WAIT_AMOUNT);
};

wait.indefinitePause = function() {
	setInterval(function() {
		kommando.browser.getTitle().then(function(t) {
			// ?
		});
	}, 2000);
};
