/*
	grunt-spiritual-build
	Copyright (c) 2013 Wunderbyte
	
	https://github.com/sampi/grunt-spiritual-build/
	grunt-spiritual-build may be freely distributed under the MIT license.
*/

const esprima = require('esprima');

/**
 * Basic syntax valid?
 * @param {string} js
 */
exports.valid = function(grunt, js, filepath) {
	return isvalid(grunt, js, filepath);
};

// Private .....................................................................

/**
 * @param {Grunt} grunt
 * @param {string} js
 * @param {string} filepath
 * @returns {boolean}
 */
function isvalid(grunt, filepath, js) {
	try {
		const config = { tolerant: true };
		const syntax = esprima.parse(js, config);
		if (syntax.errors.length) {
			syntax.errors.forEach(function(error) {
				grunt.log.error(filepath, error.message);
			});
			return false;
		}
		return true;
	} catch (exception) {
		grunt.log.write('\n');
		grunt.log.error(filepath, exception.message);
		grunt.fail.errorcount++;
		return false;
	}
}
