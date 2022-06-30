/*
	grunt-spiritual-edbml
	Copyright (c) 2013 Wunderbyte
	
	https://github.com/sampi/grunt-spiritual-edbml/
	grunt-spiritual-edbml may be freely distributed under the MIT license.
*/

const path = require('path');
const sweet = require('sweet.js');

/**
 * TODO: WHAT TO CALL THIS THING?
 * @param {Grunt} grunt
 * @param {Map<string,string>} options
 */
exports.init = function(grunt, options) {
	// TODO: load from options
	sweet.loadMacro(path.join(__dirname, '/macros/@.sjs'));

	return {
		/*
		 * Release the macros.
		 * @param {string} string
		 * @returns {string}
		 */
		compile: function(string) {
			return sweet.compile(string, {
				readableNames: true
			}).code;
		}
	};
};
