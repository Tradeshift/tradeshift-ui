/* global module */
module.exports = function(config) {
	'use strict';
	config.set({
		frameworks: ['jasmine'],
		files: [
			'karma.setup.js',
			'spiritual-gui.js',
			'spiritual-edb.js',
			'../../dist/spiritual-edbml.js',
			'edbml-models.js',
			'edbml-compiled.js',
			'../tests/**/*.js'
		],
		browsers: ['PhantomJS'],
		singleRun: true,
		preprocessors: {},
		reporters: ['progress']
	});
};
