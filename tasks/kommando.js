var kommando = require('kommando');
// var server = require('../integration_test/lib/server');
var xtend = require('node.extend');
var _ = require('lodash');

var config = require('./config').init().merge(
	'config.json',
	'config.local.json'
);

function getDriverOptions(config) {
	var bsConfig = config.browserstack;
	if (!bsConfig) {
		throw new Error('config: browserstack configuration missing');
	}
	if (!bsConfig.user) {
		throw new Error('config: browserstack.user is required for integration tests');
	}
	if (!bsConfig.key) {
		throw new Error('config: browserstack.key is required for integration tests');
	}

	return {
		username: bsConfig.user,
		accessKey: bsConfig.key
	};
}

function getCapabilities(config) {
	var testBrowsers = config.testBrowsers;
	if (!testBrowsers) {
		throw new Error('config: testBrowsers configuration missing');
	}
	if (!Array.isArray(testBrowsers)) {
		throw new Error('config: testBrowsers must be an array');
	}

	var driverOptions = getDriverOptions(config);

	return testBrowsers.map(function(b) {
		return xtend(
			{
				'browserstack.user': driverOptions.username,
				'browserstack.key': driverOptions.accessKey,
				resolution: '1280x1024'
			},
			b
		);
	});
}

var BASE_KOMMANDO_CONFIG = {
	tests: [
		'../integration_test/specs/*Spec.js',
		'../integration_test/specs/**/*Spec.js'
	]
};

function getBrowserstackConfig() {
	return _.defaults(
		{
			driver: 'browser-stack',
			driverOptions: getDriverOptions(config),
			capabilities: getCapabilities(config)
	  },
		BASE_KOMMANDO_CONFIG
	);
}

function getLocalConfig() {
	return _.defaults(
		{
			browsers: ['chrome']
		},
		BASE_KOMMANDO_CONFIG
	);
}

function task(kommandoConfig, done) {
	var PORT = config.integration_server_port;

	server.isSelenium = true;
	server.listen(PORT, function(err) {
		if (err) {
			done(false);
			return;
		}

		kommando(kommandoConfig, function(err) {
			if (err) {
				return done(false);
			}
			done();
		});
	});
}

module.exports = {
	init: function(grunt) {
		grunt.registerTask('kommando:browserstack', function() {
			var done = this.async();
			task(getBrowserstackConfig(), done);
		});

		grunt.registerTask('kommando:local', function() {
			var done = this.async();
			task(getLocalConfig(), done);
		});
	}
};
