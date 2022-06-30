/*
	grunt-spiritual-build
	Copyright (c) 2013 Wunderbyte
	
	https://github.com/sampi/grunt-spiritual-build/
	grunt-spiritual-build may be freely distributed under the MIT license.
*/

const acorn = require('acorn');
/**
 * Replace all psudosuperkeywords with
 * regular prototype `call` statements.
 * @param {string} inout
 * @param @optional {boolean|string|Array<string>} superwords
 * @param @optional {boolean|string|Array<string>} classwords
 */
exports.pseudokeyword = function(input, superwords, classwords) {
	const fixes = parse(input, superwords, classwords);
	return output(input, fixes);
};

// Private .....................................................................

/**
 * Run the computer on characters in input.
 * @param {string} input
 * @param @optional {boolean|string|Array<string>} superwords
 * @param @optional {boolean|string|Array<string>} classwords
 * @returns {Array<Fix>}
 */
function parse(input, superwords, classwords) {
	const fixes = [];
	const state = new State();
	const paren = new Paren();
	const curly = new Curly();
	const param = new Param();
	const suber = new Super();
	const words = new Words(superwords, classwords);
	acorn.parse(input, {
		ranges: true,
		ecmaVersion: 5,
		onToken: function(token) {
			ontoken(state, paren, curly, suber, param, words, token, fixes);
		}
	});
	return fixes;
}

/**
 * @param {State} state
 * @param {string} input
 * @param {Array<string>} fixes
 */
function output(input, fixes) {
	let js,
		i1,
		i2,
		delta = 0;
	return fixes.reduce(function(code, fix) {
		js = fix.newcode;
		i1 = fix.oldcode.start + delta;
		i2 = fix.oldcode.end + delta;
		delta += js.length - (i2 - i1);
		return code.substring(0, i1) + js + code.substring(i2);
	}, input);
}

// Constructors ................................................................

/**
 * TODO: Figure out how empty strings got into the params list.
 * @param {string} proto
 * @param {string} method
 * @param {Array<string>} params
 * @oaram {number} start
 * @param {number} end
 */
function Fix(proto, method, params, start, end) {
	params = params.filter(function(param) {
		return param.length;
	});
	params.unshift('this');
	this.newcode = proto + '.' + method + '.call(' + params.join(', ') + ')';
	this.oldcode = {
		start: start,
		end: end
	};
}

/**
 * General purpose mutable state.
 */
function State() {}
State.prototype = {
	parts: [],
	start: -1
};

/**
 * Tracking superclass and method to call.
 */
function Super() {}
Super.prototype = {
	protostring: null,
	maybemethod: null,
	protomethod: null
};

/**
 * Tracking supercall parameters.
 */
function Param() {}
Param.prototype = {
	done: null,
	next: null
};

/**
 * Tracking parenthesis.
 */
function Paren() {}
Paren.prototype = {
	count: 0,
	paramcount: 0,
	protocount: 0
};

/**
 * Tracking curly brackets.
 */
function Curly() {}
Curly.prototype = {
	count: 0,
	protocount: 0
};

/**
 * Tracking word(clusters) that subclasses something
 * and other words that seem to call a super method.
 * @param @optional {boolean|string|Array<string>} superwords
 * @param @optional {boolean|string|Array<string>} classwords
 */
function Words(superwords, classwords) {
	this.classwords = getwords(classwords, ['extend', 'mixin']);
	this.superwords = getwords(superwords, ['this._super']).map(function dot(word) {
		return word + '.';
	});
}
Words.prototype = {
	superwords: null,
	classwords: null
};

function getwords(words, defaults) {
	words = words === true ? defaults : words;
	words = words ?? defaults;
	return words.charAt ? [words] : words;
}

// Parse tokens ................................................................

/**
 * @param {State} state
 * @param {Paren} paren
 * @param {Curly} curly
 * @param {Suber} suber
 * @param {Param} param
 * @param {Words} words
 * @param {object} token
 * @param {Array<Fix>} fixes
 */
function ontoken(state, paren, curly, suber, param, words, token, fixes) {
	const type = token.type.label ?? token.type.type;
	const word = token.type.keyword;
	const cuts = token.type.beforeExpr;
	const value = token.value;
	if (param.done) {
		onparamtoken(state, paren, param, value, word, type);
	}
	switch (type) {
		case 'name':
			onnamedtoken(state, paren, curly, suber, param, words, token.start, value);
			break;
		case '.':
			state.parts.push(type);
			break;
		case '(':
			onparenopen(state, paren, suber, param);
			break;
		case ')':
			onparenclose(state, paren, suber, param, token, fixes);
			break;
		case '{':
			oncurlyopen(curly);
			break;
		case '}':
			oncurlyclose(state, curly, suber);
			break;
		default:
			state.parts = [];
			break;
	}
	if (word) {
		if (cuts) {
			state.parts = [];
		} else {
			state.parts.push(word);
		}
	}
}

/**
 * @param {State} state
 * @param {Paren} paren
 * @param {Param} param
 * @param {string} value
 * @param {string} word
 * @param {string} type
 */
function onparamtoken(state, paren, param, value, word, type) {
	if (type === ')' && paren.count === paren.paramcount + 1) {
		// don't collect closing parenthesis of supercall args
	} else if (type !== ',' || paren.count > paren.paramcount) {
		param.next.push(value || word || type);
	} else {
		param.done.push(param.next.join(''));
		param.next = [];
	}
}

/**
 * @param {State} state
 * @param {Paren} paren
 * @param {Curly} curly
 * @param {Param} param
 * @param {Suber} param
 * @param {number} start
 * @param {string} value
 */
function onnamedtoken(state, paren, curly, suber, param, words, start, value) {
	if (suber.protostring) {
		if (!suber.maybemethod && !param.done) {
			words.superwords.every(function checksupercall(word) {
				if (state.parts.join('') === word) {
					state.start = start - word.length;
					suber.maybemethod = value;
					return false;
				}
				return true;
			});
		}
	} else {
		words.classwords.every(function checkextends(word) {
			if (value === word) {
				suber.protostring = state.parts.join('') + 'prototype';
				curly.protocount = curly.count;
				paren.protocount = paren.count;
				return false;
			}
			return true;
		});
	}
	state.parts.push(value);
}

/**
 * @param {State} state
 * @param {Paren} paren
 * @param {Super} suber
 * @param {Param} param
 */
function onparenopen(state, paren, suber, param) {
	if (suber.maybemethod) {
		paren.paramcount = paren.count;
		suber.protomethod = suber.maybemethod;
		param.done = [];
		param.next = [];
		suber.maybemethod = null;
	}
	paren.count++;
}

/**
 * @param {State} state
 * @param {Paren} paren
 * @param {Super} suber
 * @param {Param} param
 * @param {object} token
 * @param {Array<string>} fixes
 */
function onparenclose(state, paren, suber, param, token, fixes) {
	paren.count--;
	if (suber.protostring) {
		if (param.done) {
			if (paren.count === paren.paramcount) {
				param.done.push(param.next.join(''));
				fixes.push(
					new Fix(suber.protostring, suber.protomethod, param.done, state.start, token.end)
				);
				state.start = -1;
				param.done = null;
				param.next = null;
			}
		}
		if (paren.count === paren.protocount) {
			suber.protostring = null;
		}
	}
}

/**
 * Curly brace begins.
 * @param {Curly} curly
 */
function oncurlyopen(curly) {
	curly.count++;
}

/**
 * Curly brace ends.
 * @param {State} state
 * @param {Curly} curly
 * @param {Super} suber
 */
function oncurlyclose(state, curly, suber) {
	curly.count--;
	if (suber.protostring && curly.count === curly.protocount) {
		suber.protostring = null;
	}
}
