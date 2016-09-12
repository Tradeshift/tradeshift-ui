/*global kommando*/

var helper = require('../../lib/helper');
var asides = require('../../lib/helpers/asides');
var wait = require('../../lib/wait');
var By = kommando.webdriver.By;

var DATE = By.name('date');

function originalDate() {
	return kommando.browser.findElement(By.name('date'));
}

function fakeVisibleDate() {
	return kommando.browser.findElement(By.className('ts-date'));
}

function aside() {
	return kommando.browser.findElement(asides.LOCATOR);
}

var FIRST_BUTTON_LOCATOR = By.css('.ts-aside .ts-calendar-days tr:first-child td:first-child button');
function firstDateButton() {
	return kommando.browser.findElement(FIRST_BUTTON_LOCATOR);
}

var LAST_BUTTON_LOCATOR = By.css('.ts-aside .ts-calendar-days tr:last-child td:last-child button');
function lastDateButton() {
	return kommando.browser.findElement(LAST_BUTTON_LOCATOR);
}

describe('Form Date Inputs', function() {
	helper.onPage('form/date');

	it('styles the date as expected', function(done) {
		this.takeScreenshot().then(done);
	});

	it('opens an aside', function(done) {
		var that = this;
		fakeVisibleDate().click().then(function() {
			wait.forElement(asides.LOCATOR);
			that.takeScreenshot().then(done);
		});
	});

	it('closes the aside and sets the date, after selecting a date', function(done) {
		var that = this;

		// This test depends on the first day of the month that is initially selected
		// by the calendar falling on a Monday.

		fakeVisibleDate().click().then(function() {
			wait.forElement(FIRST_BUTTON_LOCATOR);
			firstDateButton().click().then(function() {
					wait.forNoElement(asides.LOCATOR);
					originalDate().getAttribute('value').then(function(v) {
						expect(v).toBe('2014-12-01');
						that.takeScreenshot().then(done, helper.errorDone(done));
					});
				});
		});
	});

	it('should respect the max date', function(done) {
		var that = this;
		fakeVisibleDate().click().then(function() {
			wait.forElement(LAST_BUTTON_LOCATOR);
			lastDateButton().click().then(function() { // click AFTER max date...
				// perhaps timeout around here?
				originalDate().getAttribute('value').then(function(v) {
					expect(v).toBe('2014-12-29'); // nothing changed!
					that.takeScreenshot().then(done, helper.errorDone(done));
				});
			});
		});
	});
});

