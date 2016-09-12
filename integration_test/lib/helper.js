/*global process, kommando*/
var path = require('path');
var fs = require('fs');
var fsExtra = require('fs-extra');
var PORT = require('../../config').integration_server_port;
var q = require('q');

var server = require('./server');

var helper = module.exports;

var CI_SCREENSHOTS_PATH = path.join(__dirname, '..', '..', 'screenshots');
var LOCAL_SCREENSHOTS_PATH = path.join(__dirname, '..', '..', 'local-screenshots');

function getBrowserName(desc) {
	var map = {};
	desc.split(',').forEach(function(p) {
		var split = p.split('=');
		map[split[0]] = split[1];
	});

	return [
		map.browserName + '-' + map.version,
		map.os + '-' + map.os_version
	].join('_');
}

function getFullSpecName(spec) {

	var lastChildSuite;

	var suite = spec.suite;
	var nameParts = [spec.description];

	while (suite.parentSuite) {
		nameParts.unshift(suite.description);

		lastChildSuite = suite;
		suite = suite.parentSuite;
	}

	// We use the root level suite name for the folder that any sub-tests
	// screenshots are placed within.
	var root = lastChildSuite.description;

	// The top level suite is added to every spec by Kommando and its description
	// is a string identifying the current browser being ran in Selenium.
	var browser = getBrowserName(suite.description);

	// Remove root suitename from nameparts
	nameParts.shift();

	var specName = nameParts.join(' ');

	return {
		specName: specName,
		browser: browser,
		root: root
	};
}

function getScreenshotsPath() {
	if (process.env.TRADESHIFT_CI) {
		return CI_SCREENSHOTS_PATH;
	} else {
		return LOCAL_SCREENSHOTS_PATH;
	}
}

helper.setupHelpers = function(done) {
	var testContext = this;

	testContext.takeScreenshot = function(name) {
		var spec = getFullSpecName(jasmine.getEnv().currentSpec);
		var browser = spec.browser;
		var specPath = path.join(getScreenshotsPath(), spec.root, spec.specName);

		fsExtra.mkdirsSync(specPath);

		var filePath = path.join(specPath, spec.browser + '.png');

		return kommando.browser.takeScreenshot()
			.then(function(data) {
				fs.writeFileSync(filePath, data, 'base64');
			});
	};

	done();
};

helper.navTo = function(page) {
	return function(done) {
		var that = this;

		kommando.browser.get('http://localhost:3333/pages/' + page + '')
			.then(function() {
				done();
			},
			function(err) {
				expect('the page').toBe('rendered');
				console.error(err);
				done();
			});
	};
};

helper.onPage = function(page) {
	var originalTimeout;
	beforeEach(function() {
		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
	});
	afterEach(function() {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
	});

	beforeEach(helper.setupHelpers);
	beforeEach(helper.navTo(page));
};

helper.errorDone = function(done) {
	return function(err) {
		expect(err).toBe(null);
		done();
	};
};
