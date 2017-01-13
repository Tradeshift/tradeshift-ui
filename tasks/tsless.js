var path = require('path');
var chalk = require('chalk');

var comment = false;
var underline = '', it = 80;
while (it) { underline += '.'; it--; }

/**
 * Publish some LESS for public consumption (variables and mixins for now),
 * so that devs can copy-paste these things into their own LESS setup.
 */
module.exports = {
	init: function(grunt) {
		grunt.registerMultiTask('tsless', 'concat less files', function() {
			var file, folder, less;
			this.files.forEach(function(pair) {
				file = pair.src[0];
				folder = path.dirname(file);
				less = grunt.file.read(file);
				grunt.file.write(pair.dest, (
					[
						'@import "ts-variables.less";',
						'@import "ts-mixins.less";'
					].concat(
						less.split('\n')
					).map(
						importurl
					).reduce(function(all, src) {
						return all + (src ? getless(grunt, folder + '/' + src) : '');
					}, '')
				));
				grunt.log.writeln('File ' + chalk.cyan(pair.dest) + ' created');
			});
		});
	}
};

/**
 * Extract @import URL from line.
 * @param {string} less
 * @returns {string}
 */
function importurl(line) {
	var match;
	if ((match = line.match(/".+"/))) {
		return match.shift().replace(/"/g, '');
	}
}

/**
 * Read and format less.
 * @param {Grunt} grunt
 * @param {string} src
 * @returns {string}
 */
function getless(grunt, src) {
	var file, less, head;
	file = path.basename(src);
	less = grunt.file.read(src);
	less = clean(less);
	head = '// ' + file + ' ';
	return format(head, less);
}

/**
 * Cleanup that less.
 * @param {string} less
 * @returns {string}
 */
function clean(less) {
	return less.split('\n')
		.filter(nofancystuff)
		.filter(noblockcomment)
		.map(nocomment)
		.join('\n');
}

/**
 * Nice header to separate less from different files.
 * @param {string} less
 * @returns {string}
 */
function format(head, less) {
	return head + underline.substring(head.length) + '\n\n' + less + '\n\n\n';
}

/**
 * Filter @import statements and some other stuff.
 * @param {string} line
 * @returns {boolean}
 */
function nofancystuff(line) {
	var trim = line.trim();
	return trim.length &&
		trim.indexOf('//') !== 0 &&
		trim.indexOf('@import') !== 0;
}

/**
 * Remove trailing comment.
 * @param {string} line
 * @returns {strig}
 */
function nocomment(line) {
	return line.replace(/ \/\/.+$/, '').trimRight();
}

/**
 * Filter stuff in block comments.
 * @param {string} line
 * @returns {boolean}
 */
function noblockcomment(line) {
	var trim = line.trim();
	if (!comment && trim.startsWith('/*')) {
		if (!trim.endsWith('*/')) {
			comment = true;
		}
		return false;
	}
	if (comment && trim.startsWith('*/')) {
		comment = false;
		return false;
	}
	return !comment;
}
