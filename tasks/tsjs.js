var chalk = require('chalk');

/**
 * Setup ts.js (the JS and CSS bootloader).
 */
module.exports = {
	init: function(grunt) {
		var localhost = '127.0.0.1';
		var publichost = getip();
		grunt.registerMultiTask('tsjs', 'ts.js for cdn', function() {
			var options = this.options();
			Object.keys(options).forEach(function(key) {
				options[key] = grunt.template.process(options[key]).replace(localhost, publichost);
			});
			this.files.forEach(function(pair) {
				tsjs(grunt, pair.src[0], pair.dest, options);
			});
		});
	}
};

/**
 * TODO: There is really no need for a special task
 * here now that the script doesn't inject the CSS.
 * @param {Grunt} grunt
 * @param {string} source
 * @param {string} target
 * @param {Map} options
 */
function tsjs(grunt, source, target, options) {
	var js = grunt.file.read(source);
	grunt.file.write(target, js);
	grunt.log.writeln('File ' + chalk.cyan(target) + ' created');
}

/**
 * Dig up our network IP. This will allow us to remove '127.0.0.1'
 * from the path, a bonus for mobile device testing. This whole
 * dilemma is of course only relevant for devs running localhost.
 * @returns {string}
 */
function getip() {
	var result = null;
	var ifaces = require('os').networkInterfaces();
	Object.keys(ifaces).forEach(function(dev) {
		ifaces[dev].every(function(details) {
			if (details.family === 'IPv4') {
				result = details.address;
			}
			return !result;
		});
	});
	if (result === '127.0.0.1') {
		result = 'localhost'; // otherwise not work offline (?)
	}
	return result;
}
