/*
	grunt-spiritual-edbml
	Copyright (c) 2013 Wunderbyte
	
	https://github.com/sampi/grunt-spiritual-edbml/
	grunt-spiritual-edbml may be freely distributed under the MIT license.
*/

const shorthash = require('./shorthash');

/**
 * Genereate hash for file name.
 * @param {string} string
 * @returns {string}
 */
exports.unique = function(filepath, index) {
	return '$' + shorthash.unique(filepath) + index;
};

/**
 * Format script attributes as hashmap.
 * @param {$} script (Cheerio object)
 * @param @optional {Map} extras
 * @returns {Map<String,object>}
 */
exports.directives = function(script, extras) {
	const map = {};
	Object.keys(script[0].attribs).forEach(function(key) {
		map[key] = autocast(map[key]);
	});
	Object.keys(extras || {}).forEach(function(key) {
		map[key] = extras[key];
	});
	return map;
};

/**
 * Produce JS declarations.
 * @param {string} name
 * @param {string} name
 * @returns {string}
 */
exports.declare = function(name, result) {
	var json;
	const fun = result.functionstring;
	let pis = result.instructionset;
	let output = 'edbml.declare("' + name + '").as(' + fun;
	if (pis && (pis = filterpis(pis)).length) {
		json = formatjson(pis);
		json = JSON.stringify(json);
		json = json.replace(/"(\w+)"\s*:/g, '$1:');
		output += ').withInstructions(' + json + ');';
	} else {
		output += ');';
	}
	return output;
};

/**
 * Only relay <?input?> instructions to the client
 * since the rest aren't really needed right now.
 * @param {Array<Instruction>} pis
 * @returns {Array<Instruction>}
 */
function filterpis(pis) {
	return pis.filter(function(pi) {
		return pi.tag === 'input';
	});
}

/**
 * Format processing instructions
 * for slight improved readability.
 * @param {Array<Instruction>} pis
 * @returns {Array<object>}
 */
function formatjson(pis) {
	return pis.map(function(pi) {
		const newpi = {};
		newpi[pi.tag] = pi.att;
		return newpi;
	});
}

/**
 * @todo COPY-PASTE!
 * Autocast string to an inferred type. "123" returns a number
 * while "true" and false" return a boolean. Empty string evals
 * to `true` in order to support HTML attribute minimization.
 * @param {string} string
 * @returns {object}
 */
function autocast(string) {
	let result = String(string);
	switch (result) {
		case 'null':
			result = null;
			break;
		case 'true':
		case 'false':
			result = result === 'true';
			break;
		default:
			if (String(parseInt(result, 10)) === result) {
				result = parseInt(result, 10);
			} else if (String(parseFloat(result)) === result) {
				result = parseFloat(result);
			}
			break;
	}
	return result === '' ? true : result;
}
