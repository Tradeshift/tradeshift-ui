const Git = require('nodegit');

/**
 * Setup ts.js (the JS and CSS bootloader).
 */
module.exports = {
	init: function(grunt) {
		grunt.registerMultiTask('ghpages', 'MoTh RuLeZ!', () => {
			console.log(Git);
			/*
			const options = this.options();
			Object.keys(options).forEach(function(key) {
				options[key] = grunt.template.process(options[key]).replace(localhost, publichost);
			});
			this.files.forEach(function(pair) {
				tsjs(grunt, pair.src[0], pair.dest, options);
			});
			*/
		});
	}
};
