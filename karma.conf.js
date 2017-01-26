/* global module */
module.exports = function(karmaConfig) {
	'use strict';

	var confObj = {
		hostname: 'localhost',
		frameworks: ['jasmine'],

		files: [
			'test/setup.js',
			'dist/ts.js',
			'test/spiritual/**/*.spec.js',
			'test/runtime/**/*.spec.js',
			{pattern: 'dist/*', included: false, served: true},
			{pattern: 'node_modules/**/*', included: false, served: true}
		],

		singleRun: true,
		preprocessors: {},
		reporters: ['spec'],
		specReporter: {
			maxLogLines: 10,
			suppressErrorSummary: false,
			suppressFailed: false,
			suppressPassed: false,
			suppressSkipped: true,
			showSpecTiming: true
		},
		logLevel: 'INFO',

		browserDisconnectTimeout : 10000, // default 2000
		browserDisconnectTolerance : 1, // default 0
		browserNoActivityTimeout : 60000 //default 10000
		
	};

	karmaConfig.set(confObj);
};
