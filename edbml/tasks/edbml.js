/*
	grunt-spiritual-edbml
	Copyright (c) 2013 Wunderbyte
	
	https://github.com/sampi/grunt-spiritual-edbml/
	grunt-spiritual-edbml may be freely distributed under the MIT license.
*/

const inliner = require('./things/inliner');
const outliner = require('./things/outliner');
const macrunner = require('./things/macrunner');

/**
 * Here it comes.
 * @param {Grunt} grunt
 */
module.exports = function(grunt) {
	grunt.registerMultiTask('edbml', 'Trawl EDBML', function() {
		const options = this.options();
		const macros = macrunner.init(grunt, options);
		const done = this.async();
		if (options.inline) {
			inliner.process(grunt, this.files, options, macros, done); // !!!!
		} else {
			outliner.process(grunt, this.data.files, options, macros, done);
		}
	});
};
