var By = kommando.webdriver.By;
var wait = require('../../lib/wait');
var helper = require('../../lib/helper');

function originalDate() {
	return kommando.browser.findElement(By.name('date'));
}

function fakeVisibleDate() {
	return kommando.browser.findElement(By.className('ts-date'));
}

function boundElement() {
	return kommando.browser.findElement(By.id('bound'));
}

var ASIDE_LOCATOR = By.className('ts-aside');
function aside() {
	return kommando.browser.findElement(ASIDE_LOCATOR);
}

var FIRST_BUTTON_LOCATOR = By.css('.ts-aside .ts-calendar-days tr:first-child td:first-child button');
function firstDateButton() {
	return kommando.browser.findElement(FIRST_BUTTON_LOCATOR);
}

describe('ng-model on date input', function() {
	helper.onPage('angular/ng-model_date_input');

	/*
	 * This test depends on the first day of the month that is 
	 * initially selected by the calendar falling on a Monday.
	 */
	it('takes the value selected by in the date', function(done) {
		var that = this;
		fakeVisibleDate().click().then(function() {
			wait.forElement(FIRST_BUTTON_LOCATOR);
			firstDateButton().click().then(function() {
					wait.forNoElement(ASIDE_LOCATOR);
					originalDate().getAttribute('value').then(function(v) {
						expect(v).toBe('2013-07-01');
						boundElement().getText('value').then(function(v) {
							expect(v).toBe('2013-07-01');
							that.takeScreenshot().then(done, helper.errorDone(done));
						});
					});
				});
		});
	});

});
