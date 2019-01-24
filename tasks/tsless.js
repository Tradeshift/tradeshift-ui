const path = require('path');
const chalk = require('chalk');

/**
 * Used in the state-machine
 * @see noBlockComment()
 * @type {boolean}
 */
let commentState = false;

/**
 * Underline used for styling cool comments
 * @type {string}
 */
const EIGHTY_WIDE_UNDERLINE =
	'................................................................................';

/**
 * Extract @import URL from line.
 * @param {string} line
 * @returns {string}
 */
const importURL = line => {
	const match = line.match(/'.+'/);
	if (match) {
		return match.shift().replace(/'/g, '');
	}
};

/**
 * Read and format less.
 * @param {Grunt} grunt
 * @param {string} src
 * @returns {string}
 */
const getLESS = (grunt, src) => {
	const file = path.basename(src);
	const less = clean(grunt.file.read(src));
	const head = '// ' + file + ' ';
	return format(head, less);
};

/**
 * Cleanup that less.
 * @param {string} less
 * @returns {string}
 */
const clean = less =>
	less
		.split('\n')
		.filter(noFancyStuff)
		.filter(noBlockComment)
		.map(noComment)
		.join('\n');

/**
 * Nice header to separate less from different files.
 * @param {string} head
 * @param {string} less
 * @returns {string}
 */
const format = (head, less) =>
	head + EIGHTY_WIDE_UNDERLINE.substring(head.length) + '\n\n' + less + '\n\n\n';

/**
 * Filter @import statements and some other stuff.
 * @param {string} line
 * @returns {boolean}
 */
const noFancyStuff = line => {
	const trim = line.trim();
	return trim.indexOf('@import') !== 0;
};

/**
 * Remove trailing comment.
 * @param {string} line
 * @returns {string}
 */
const noComment = line => line.replace(/ \/\/.+$/, '').trimRight();

/**
 * Filter stuff in block comments.
 * @param {string} line
 * @returns {boolean}
 */
const noBlockComment = line => {
	const trim = line.trim();
	if (!commentState && trim.startsWith('/*')) {
		if (!trim.endsWith('*/')) {
			commentState = true;
		}
		return false;
	}
	if (commentState && trim.startsWith('*/')) {
		commentState = false;
		return false;
	}
	return !commentState;
};

/**
 * Publish some LESS for public consumption (variables and mixins for now),
 * so that devs can copy-paste these things into their own LESS setup.
 */
module.exports = {
	init: grunt => {
		grunt.registerMultiTask('tsless', 'concat less files', function tsless() {
			this.files.forEach(pair => {
				const file = pair.src[0];
				const folder = path.dirname(file);
				const less = grunt.file.read(file);
				grunt.file.write(
					pair.dest,
					less
						.split('\n')
						.map(importURL)
						.filter(e => e)
						.reduce((all, src) => all + getLESS(grunt, folder + '/' + src), '')
				);
				grunt.log.writeln('File ' + chalk.cyan(pair.dest) + ' created');
			});
		});
	}
};
