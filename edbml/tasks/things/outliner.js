/*
	grunt-spiritual-edbml
	Copyright (c) 2013 Wunderbyte
	
	https://github.com/sampi/grunt-spiritual-edbml/
	grunt-spiritual-edbml may be freely distributed under the MIT license.
*/

const cheerio = require('cheerio');
const chalk = require('chalk');
const compiler = require('./compiler');
const formatter = require('./formatter');
const assistant = require('./assistant');
const path = require('path');

/**
 * Concat and minify files.
 * @param {Grunt} grunt
 * @param {Map<String,String} files
 * @param {Map<String,String} options
 * @param {function} done
 */
exports.process = function(grunt, files, options, macros, done) {
	errors = false;
	if (!Array.isArray(files)) {
		Object.keys(files).forEach(function(target) {
			const sources = grunt.file.expand(files[target]);
			const results = trawloutline(grunt, sources, options, macros);
			if (results.length && !errors) {
				target = grunt.template.process(target);
				grunt.file.write(target, results);
				grunt.log.writeln('File ' + chalk.cyan(target) + ' created.');
			}
		});
		done();
	} else {
		grunt.log.error('Object expected');
	}
};

// Private ...............................................................................

/**
 * Match something that can be used as a function or variable name (no weirdo dashes etc).
 * http://stackoverflow.com/questions/2008279/validate-a-javascript-function-name/2008444#2008444
 * @type {RegExp}
 */
const IDENTIFIER = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

/**
 * @todo COPY-PASTE!
 * Flip to abort file system updates.
 * @type {boolean}
 */
let errors = false;

/**
 * @todo COPY-PASTE!
 * @param {string} message
 */
function error(message) {
	console.error(message);
	errors = true;
}

/**
 * @returns {string}
 */
function trawloutline(grunt, sources, options, macros) {
	const results = [];

	sources.forEach(function(src) {
		const $ = cheerio.load(grunt.file.read(src));
		getscripts($, src, options).each(function(i, script) {
			const js = parse($(script), options, macros);
			results.push(comment(src) + formatter.beautify(js));
		});
	});
	return results.join('\n\n');
}

/**
 * @returns {$}
 */
function getscripts($, src) {
	const scripts = $('script');

	if (scripts.length === 1) {
		const script = $(scripts[0]);
		if (!script.attr('id')) {
			const name = path.basename(src);
			if (validname(name)) {
				script.attr('id', name);
			} else {
				error('File name unfit for declaration as a JS object: ' + name);
			}
		}
	} else {
		if (
			!Array.prototype.every.call(scripts, function(script) {
				return $(script).attr('id');
			})
		) {
			error('ID required when multiples script in file: ' + src);
		}
	}
	return scripts;
}

/**
 * @param {string} name
 * @returns {boolean}
 */
function validname(name) {
	name = name.replace(/\./g, '');
	return !!name.match(IDENTIFIER);
}

/**
 * Parse single script.
 * @param {$} script
 * @param {???} macros
 * @returns {string}
 */
function parse(script, options, macros) {
	const name = script.attr('id');
	const text = script.text();
	const atts = assistant.directives(script);
	return compile(name, text, options, macros, atts);
}

/**
 * Compile EDBML to JS with directives.
 * @param {string} name
 * @param {string} edbml
 * @param {Map<string,object>} options
 * @param {Map<string,object>} options
 */
function compile(name, edbml, options, macros, directives) {
	const result = compiler.compile(edbml, options, macros, directives);
	return assistant.declare(name, result);
}

/**
 * Stamp the EDBML src into a comment.
 * @param {string} src
 * @returns {string}
 */
function comment(src) {
	return '// ' + src + '\n';
}
