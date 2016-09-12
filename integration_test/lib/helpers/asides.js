var asides = module.exports;

var By = kommando.webdriver.By;
var wait = require('../wait');

asides.LOCATOR = By.className('ts-aside');
asides.COVER_LOCATOR = By.id('ts-asidecover');

asides.get = function() {
	return kommando.browser.findElement(asides.LOCATOR);
};

asides.getCover = function() {
	wait.forElement(asides.COVER_LOCATOR);
	return kommando.browser.findElement(asides.COVER_LOCATOR);
};

asides.getClosingButton = function(selector) {
	return kommando.browser.findElement({
		css: selector + ' header .ts-button' // was .ts-icon-close
	});
};
