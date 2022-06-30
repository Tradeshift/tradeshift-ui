/*
	grunt-spiritual-edbml
	Copyright (c) 2013 Wunderbyte
	
	https://github.com/sampi/grunt-spiritual-edbml/
	grunt-spiritual-edbml may be freely distributed under the MIT license.
*/

/**
 * Call function for each own key in object (exluding the prototype stuff)
 * with key and value as arguments. Returns array of function call results.
 * @param {object} object
 * @param {function} func
 * @param @optional {object} thisp
 */
function _get(target, property, receiver) {
	if (typeof Reflect !== 'undefined' && Reflect.get) {
		_get = Reflect.get;
	} else {
		_get = function _get(target, property, receiver) {
			var base = _superPropBase(target, property);
			if (!base) return;
			var desc = Object.getOwnPropertyDescriptor(base, property);
			if (desc.get) {
				return desc.get.call(receiver);
			}
			return desc.value;
		};
	}
	return _get(target, property, receiver || target);
}

function _superPropBase(object, property) {
	while (!Object.prototype.hasOwnProperty.call(object, property)) {
		object = _getPrototypeOf(object);
		if (object === null) break;
	}
	return object;
}

function _typeof(obj) {
	if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === 'function' &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? 'symbol'
				: typeof obj;
		};
	}
	return _typeof(obj);
}

function _possibleConstructorReturn(self, call) {
	if (call && (_typeof(call) === 'object' || typeof call === 'function')) {
		return call;
	}
	return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
	if (self === void 0) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}
	return self;
}

function _getPrototypeOf(o) {
	_getPrototypeOf = Object.setPrototypeOf
		? Object.getPrototypeOf
		: function _getPrototypeOf(o) {
				return o.__proto__ || Object.getPrototypeOf(o);
		  };
	return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== 'function' && superClass !== null) {
		throw new TypeError('Super expression must either be null or a function');
	}
	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: { value: subClass, writable: true, configurable: true }
	});
	if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
	_setPrototypeOf =
		Object.setPrototypeOf ||
		function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};
	return _setPrototypeOf(o, p);
}

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError('Cannot call a class as a function');
	}
}

function _defineProperties(target, props) {
	for (var i = 0; i < props.length; i++) {
		var descriptor = props[i];
		descriptor.enumerable = descriptor.enumerable || false;
		descriptor.configurable = true;
		if ('value' in descriptor) descriptor.writable = true;
		Object.defineProperty(target, descriptor.key, descriptor);
	}
}

function _createClass(Constructor, protoProps, staticProps) {
	if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	if (staticProps) _defineProperties(Constructor, staticProps);
	return Constructor;
}

function each(object, func, thisp) {
	return Object.keys(object).map(function(key) {
		return func.call(thisp, key, object[key]);
	});
}

/**
 * Autocast string to an inferred type. "123" returns a number
 * while "true" and false" return a boolean. Empty string evals
 * to `true` in order to support HTML attribute minimization.
 * @param {string} string
 * @returns {object}
 */
function cast(string) {
	var result = String(string);

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

/**
 * Generate unique key.
 * Note: Key structure must be kept in sync with {gui.KeyMaster#generatekey}.
 * @returns {string}
 */
var generateKey = (function() {
	var keys = {};
	return function() {
		var ran = Math.random().toString();
		var key = 'key' + ran.slice(2, 11);

		if (keys[key]) {
			key = generateKey();
		} else {
			keys[key] = true;
		}

		return key;
	};
})();

/**
 * Base compiler.
 * Note to self: Conceptualize peek|poke|geek|passout|lockout
 */
var Compiler =
	/*#__PURE__*/
	(function() {
		/**
		 * Let's go.
		 */
		function Compiler() {
			_classCallCheck(this, Compiler);

			this._keycounter = 0;
		}
		/**
		 * Line begins.
		 * @param {string} line
		 * @param {Runner} runner
		 * @param {Status} status
		 * @param {Markup} markup
		 * @param {Output} output
		 */

		_createClass(Compiler, [
			{
				key: 'newline',
				value: function newline(line, runner, status, markup, output) {
					status.last = line.length - 1;
					status.adds = line[0] === '+';
					status.cont = status.cont || (status.ishtml() && status.adds);
				}
				/**
				 * Line ends.
				 * @param {string} line
				 * @param {Runner} runner
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: 'endline',
				value: function endline(line, runner, status, markup, output) {
					if (status.ishtml()) {
						if (!status.cont) {
							output.body += "';\n";
							status.gojs();
						}
					} else {
						output.body += '\n';
					}

					status.cont = false;
				}
				/**
				 * Next char.
				 * @param {string} c
				 * @param {Runner} runner
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: 'nextchar',
				value: function nextchar(c, runner, status, markup, output) {
					switch (status.mode) {
						case Status.MODE_JS:
							this._compilejs(c, runner, status, markup, output);

							break;

						case Status.MODE_HTML:
							this._compilehtml(c, runner, status, markup, output);

							break;
					}

					if (status.skip-- <= 0) {
						if (status.poke || status.geek) {
							output.temp += c;
						} else {
							if (!status.istag()) {
								output.body += c;
							}
						}
					}

					if (runner.done) {
						markup.debug();
					}
				} // Private ...................................................................

				/**
				 * Compile EDBML source to function body.
				 * @param {string} script
				 * @returns {string}
				 */
			},
			{
				key: '_compile',
				value: function _compile(script) {
					var runner = new Runner();
					var status = new Status();
					var markup = new Markup();
					var output = new Output();
					runner.run(this, script, status, markup, output);
					output.body += (status.ishtml() ? "';" : '') + '\nreturn out.write ();';
					return output.body;
				}
				/**
				 * Compile character as script.
				 * @param {string} c
				 * @param {Runner} runner
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_compilejs',
				value: function _compilejs(c, runner, status, markup, output) {
					switch (c) {
						case '<':
							if (runner.firstchar) {
								status.gohtml();
								markup.next(c);
								status.spot = output.body.length - 1;
								output.body += "out.html += '";
							}

							break;

						case '@':
							// handled by the @ macro
							break;
					}
				}
				/**
				 * Compile character as HTML.
				 * @param {string} c
				 * @param {Runner} runner
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_compilehtml',
				value: function _compilehtml(c, runner, status, markup, output) {
					var special = status.peek || status.poke || status.geek;

					if (!this._continueshtml(c, runner, status)) {
						var context = markup.next(c);

						switch (c) {
							case '{':
								if (special) {
									status.curl++;
								}

								break;

							case '}':
								if (--status.curl === 0) {
									if (status.peek) {
										status.peek = false;
										status.skip = 1;
										status.curl = 0;
										output.body += ") + '";
									}

									if (status.poke) {
										this._poke(status, markup, output);

										status.poke = false;
										output.temp = null;
										status.skip = 1;
										status.curl = 0;
									}

									if (status.geek) {
										this._geek(status, markup, output);

										status.geek = false;
										output.temp = null;
										status.skip = 1;
										status.curl = 0;
									}
								}

								break;

							case '$':
								if (!special && runner.ahead('{')) {
									status.peek = true;
									status.skip = 2;
									status.curl = 0;
									output.body += "' + " + this._escapefrom(context) + ' (';
								}

								break;

							case '#':
								if (!special && runner.ahead('{')) {
									status.poke = true;
									status.skip = 2;
									status.curl = 0;
									output.temp = '';
								}

								break;

							case '?':
								if (!special && runner.ahead('{')) {
									status.geek = true;
									status.skip = 2;
									status.curl = 0;
									output.temp = '';
								}

								break;

							case "'":
								if (!special) {
									output.body += '\\';
								}

								break;

							case '@':
								this._htmlatt(runner, status, markup, output);

								break;
						}
					}
				}
				/**
				 * HTML continues on next line or
				 * was continued from previous line?
				 * @param {string} c
				 * @param {Runner} runner
				 * @param {Status} status
				 * @returns {boolean}
				 */
			},
			{
				key: '_continueshtml',
				value: function _continueshtml(c, runner, status) {
					if (c === '+') {
						if (runner.firstchar) {
							status.skip = status.adds ? 1 : 0;
							return true;
						} else if (runner.lastchar) {
							status.cont = true;
							status.skip = 1;
							return true;
						}
					}

					return false;
				}
				/**
				 * Get function to escape potentially
				 * unsafe text in given markup context.
				 * @param {string} context Markup state
				 * @returns {string} Function name
				 */
			},
			{
				key: '_escapefrom',
				value: function _escapefrom(context) {
					switch (context) {
						case Markup.CONTEXT_TXT:
							return '$txt';

						case Markup.CONTEXT_VAL:
							return '$val';

						default:
							return '';
					}
				}
				/**
				 * Parse @ notation in HTML.
				 * @param {Runner} runner
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_htmlatt',
				value: function _htmlatt(runner, status, markup, output) {
					var attr = Compiler._ATTREXP;
					var rest, name, dels, what;

					if (runner.behind('@')) {
					} else if (runner.behind('#{')) {
						console.error('todo');
					} else if (runner.ahead('@')) {
						output.body += "' + $att.$all() + '";
						status.skip = 2;
					} else {
						rest = runner.lineahead();
						name = attr.exec(rest)[0];
						dels = runner.behind('-');
						what = dels ? '$att.$pop' : '$att.$';
						output.body = dels ? output.body.substring(0, output.body.length - 1) : output.body;
						output.body += "' + " + what + " ( '" + name + "' ) + '";
						status.skip = name.length + 1;
					}
				}
				/**
				 * Generate $poke at marked spot.
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_poke',
				value: function _poke(status, markup, output) {
					var tag = markup.tag || '';
					var arg = tag.match(/input|textarea/) ? 'value, checked' : '';

					this._injectcombo(status, markup, output, {
						outline: 'var $name = $set(function(' + arg + ') {\n$temp;\n}, this);',
						inline: "edbml.$run(this, \\'' + $name + '\\');"
					});
				}
				/**
				 * Generate ?geek at marked spot.
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_geek',
				value: function _geek(status, markup, output) {
					this._injectcombo(status, markup, output, {
						outline: 'var $name = $set(function() {\nreturn $temp;\n}, this);',
						inline: "edbml.$get(&quot;' + $name + '&quot;);"
					});
				}
				/**
				 * Inject outline and inline combo at marked spot.
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 * @param {Map<string,string>} combo
				 */
			},
			{
				key: '_injectcombo',
				value: function _injectcombo(status, markup, output, combo) {
					var body = output.body,
						temp = output.temp,
						spot = status.spot,
						prev = body.substring(0, spot),
						next = body.substring(spot),
						name = '$' + ++this._keycounter;
					var outl = combo.outline.replace('$name', name).replace('$temp', temp);
					output.body = prev + '\n' + outl + next + combo.inline.replace('$name', name);
					status.spot += outl.length + 1;
				}
			}
		]);

		return Compiler;
	})(); // Static ......................................................................

/**
 * Matches a qualified attribute name (class,id,src,href) allowing
 * underscores, dashes and dots while not starting with a number.
 * TODO: class and id may start with a number nowadays!!!!!!!!!!!!
 * TODO: https://github.com/jshint/jshint/issues/383
 * @type {RegExp}
 */

Compiler._ATTREXP = /^[^\d][a-zA-Z0-9-_\.]+/;
/**
 * Function compiler.
 * @extends {Compiler}
 */

var FunctionCompiler =
	/*#__PURE__*/
	(function(_Compiler) {
		_inherits(FunctionCompiler, _Compiler);

		/**
		 * Construction time again.
		 */
		function FunctionCompiler() {
			var _this;

			_classCallCheck(this, FunctionCompiler);

			_this = _possibleConstructorReturn(this, _getPrototypeOf(FunctionCompiler).call(this));
			/**
			 * Compile sequence.
			 * @type {Array<function>}
			 */

			_this._sequence = [
				_this._uncomment,
				_this._validate,
				_this._extract,
				_this._direct,
				_this._compile,
				_this._definehead,
				_this._injecthead,
				_this._macromize
			];
			/**
			 * Options from Grunt.
			 * @type {Map}
			 */

			_this._options = null;
			/**
			 * Hm.
			 */

			_this._macros = null;
			/**
			 * Mapping script tag attributes.
			 * This may be put to future use.
			 * @type {Map<string,string>}
			 */

			_this._directives = null;
			/**
			 * Processing intstructions.
			 * @type {Array<Instruction>}
			 */

			_this._instructions = null;
			/**
			 * Compiled arguments list.
			 * @type {Array<string>}
			 */

			_this._params = null;
			/**
			 * Tracking imported functions.
			 * @type {Map<string,string>}
			 */

			_this._functions = {};
			/**
			 * Did compilation fail just yet?
			 * @type {boolean}
			 */

			_this._failed = false;
			return _this;
		}
		/**
		 * Compile EDBML source to function.
		 * @param {string} source
		 * @param {Map<string,string} options
		 * @param {???} macros
		 * @param {Map<string,string} directives
		 * @returns {Result}
		 */

		_createClass(FunctionCompiler, [
			{
				key: 'compile',
				value: function compile(source, options, macros, directives) {
					var _this2 = this;

					this._directives = directives || {};
					this._options = options || {};
					this._macros = macros;
					this._params = [];
					this._functions = {};
					this._head = {};
					source = this._sequence.reduce(function(s, step) {
						return step.call(_this2, s);
					}, source);
					return new Result(source, this._params, this._instructions);
				} // Private ...................................................................

				/**
				 * Strip HTML and JS comments.
				 * @param {string} script
				 * @returns {string}
				 */
			},
			{
				key: '_uncomment',
				value: function _uncomment(script) {
					return new Stripper().strip(script);
				}
				/**
				 * Confirm no nested EDBML scripts.
				 * @see http://stackoverflow.com/a/6322601
				 * @param {string} script
				 * @returns {string}
				 */
			},
			{
				key: '_validate',
				value: function _validate(script) {
					if (FunctionCompiler._NESTEXP.test(script)) {
						throw 'Nested EDBML dysfunction';
					}

					return script;
				}
				/**
				 * Handle directives. Nothing by default.
				 * @param  {string} script
				 * @returns {string}
				 */
			},
			{
				key: '_direct',
				value: function _direct(script) {
					return script;
				}
				/**
				 * Extract and evaluate processing instructions.
				 * @param {string} script
				 * @returns {string}
				 */
			},
			{
				key: '_extract',
				value: function _extract(script) {
					var _this3 = this;

					Instruction.from(script).forEach(function(pi) {
						_this3._instructions = _this3._instructions || [];

						_this3._instructions.push(pi);

						_this3._instruct(pi);
					});
					return Instruction.clean(script);
				}
				/**
				 * Evaluate processing instruction.
				 * @param {Instruction} pi
				 */
			},
			{
				key: '_instruct',
				value: function _instruct(pi) {
					var att = pi.att;

					switch (pi.tag) {
						case 'param':
							this._params.push(att.name);

							break;

						case 'function':
							this._functions[att.name] = att.src;
							break;
					}
				}
				/**
				 * Define stuff in head. Using var name underscore hack
				 * to bypass the macro hygiene, will be normalized later.
				 * TODO: In string checks, also check for starting '('
				 * @param {string} script
				 * @param {object} head
				 * @returns {string}
				 */
			},
			{
				key: '_definehead',
				value: function _definehead(script) {
					var head = this._head;
					var params = this._params;
					var functions = this._functions;

					if (params.indexOf('out') < 0) {
						head.out = '$edbml.$out__MACROFIX';
					}

					if (script.includes('@')) {
						// TODO: run macros FIRST at look for '$att' ???
						head.$att__MACROFIX = '$edbml.$att__MACROFIX';
					}

					if (script.includes('$set')) {
						head.$set = 'edbml.$set';
					}

					if (script.includes('$txt')) {
						head.$txt = 'edbml.safetext';
					}

					if (script.includes('$val')) {
						head.$val = 'edbml.safeattr';
					}

					each(functions, function(name, src) {
						head[name] = src + '.lock(out)';
					});
					return script;
				}
				/**
				 * Inject stuff in head. Let's just hope that V8 keeps on iterating
				 * object keys in chronological order (in which they were defined).
				 * @param {string} script
				 * @param {object} head
				 * @returns {string}
				 */
			},
			{
				key: '_injecthead',
				value: function _injecthead(script, head) {
					return (
						"'use strict';\n" +
						'var ' +
						each(this._head, function(name, value) {
							return name + (value !== undefined ? ' = ' + value : '');
						}).join(',') +
						';' +
						script
					);
				}
				/**
				 * Release the macros. Normalize variable names that were
				 * hacked  to bypass the internal macro hygiene routine.
				 * @param {string} script
				 * @returns {string}
				 */
			},
			{
				key: '_macromize',
				value: function _macromize(script) {
					script = this._macros ? this._macros.compile(script) : script;
					return script.replace(/__MACROFIX/g, '');
				}
				/**
				 * Compute full script source (including arguments) for debugging stuff.
				 * @returns {string}
				 */
			},
			{
				key: '_source',
				value: function _source(source, params) {
					var lines = source.split('\n');
					lines.pop(); // empty line :/

					var args = params.length ? '( ' + params.join(', ') + ' )' : '()';
					return 'function ' + args + ' {\n' + lines.join('\n') + '\n}';
				}
			}
		]);

		return FunctionCompiler;
	})(Compiler); // Static ......................................................................

/**
 * RegExp used to validate no nested scripts. Important back when all this was a
 * clientside framework because the browser can't parse nested scripts, nowadays
 * it might be practical?
 * http://stackoverflow.com/questions/1441463/how-to-get-regex-to-match-multiple-script-tags
 * http://stackoverflow.com/questions/1750567/regex-to-get-attributes-and-body-of-script-tags
 * TODO: stress test for no SRC attribute!
 * @type {RegExp}
 */

FunctionCompiler._NESTEXP = /<script.*type=["']?text\/edbml["']?.*>([\s\S]+?)/g;
/**
 * Script compiler.
 * @extends {FunctionCompiler}
 */

var ScriptCompiler =
	/*#__PURE__*/
	(function(_FunctionCompiler) {
		_inherits(ScriptCompiler, _FunctionCompiler);

		/**
		 * Map observed types.
		 * Add custom sequence.
		 * @param {string} key
		 */
		function ScriptCompiler() {
			var _this4;

			_classCallCheck(this, ScriptCompiler);

			_this4 = _possibleConstructorReturn(this, _getPrototypeOf(ScriptCompiler).call(this));
			_this4.inputs = {};
			return _this4;
		} // Private ...................................................................

		/**
		 * Handle instruction.
		 * @overrides {FunctionCompiler._instruct}
		 * @param {Instruction} pi
		 */

		_createClass(ScriptCompiler, [
			{
				key: '_instruct',
				value: function _instruct(pi) {
					_get(_getPrototypeOf(ScriptCompiler.prototype), '_instruct', this).call(this, pi);

					var atts = pi.att;

					switch (pi.tag) {
						case 'input':
							this.inputs[atts.name] = atts.type;
							break;
					}
				}
				/**
				 * Define stuff in head.
				 * @param {string} script
				 * @param {object} head
				 * @returns {string}
				 */
			},
			{
				key: '_definehead',
				value: function _definehead(script) {
					var _this5 = this;

					script = _get(_getPrototypeOf(ScriptCompiler.prototype), '_definehead', this).call(
						this,
						script
					);
					each(
						this.inputs,
						function(name, type) {
							_this5._head[name] = '$edbml.$input(' + type + ')';
						},
						this
					);
					return script;
				}
			}
		]);

		return ScriptCompiler;
	})(FunctionCompiler);

/**
 * EDB processing instruction.
 * TODO: Problem with one-letter variable names in <?input name="a" type="TestData"?>
 * @param {string} pi
 */

var Instruction =
	/**
	 * @param {string} pi
	 */
	function Instruction(pi) {
		_classCallCheck(this, Instruction);

		this.tag = pi.split('<?')[1].split(' ')[0];
		this.att = Object.create(null);
		var hit,
			atexp = Instruction._ATEXP;

		while ((hit = atexp.exec(pi))) {
			var n = hit[1],
				v = hit[2];
			this.att[n] = cast(v);
		}
	}; // Static ......................................................................

/**
 * Extract processing instructions from source.
 * @param {string} source
 * @returns {Array<Instruction>}
 */

Instruction.from = function(source) {
	var pis = [],
		hit = null;

	while ((hit = this._PIEXP.exec(source))) {
		pis.push(new Instruction(hit[0]));
	}

	return pis;
};
/**
 * Remove processing instructions from source.
 * @param {string} source
 * @returns {string}
 */

Instruction.clean = function(source) {
	return source.replace(this._PIEXP, '');
};
/**
 * Math processing instruction.
 * @type {RegExp}
 */

Instruction._PIEXP = /<\?.[^>?]+\?>/g;
/**
 * Match attribute name and value.
 * @type {RegExp}
 */

Instruction._ATEXP = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
/**
 * Strip out comments in the crudest possible way.
 */

var Stripper =
	/*#__PURE__*/
	(function() {
		function Stripper() {
			_classCallCheck(this, Stripper);
		}

		_createClass(Stripper, [
			{
				key: 'strip',

				/**
				 * Strip HTML and JS comments.
				 * @param {string} script
				 * @returns {string}
				 */
				value: function strip(script) {
					script = this._stripout(script, '<!--', '-->');
					script = this._stripout(script, '/*', '*/');
					script = this._stripout(script, '^//', '\n');
					return script;
				} // Private ...................................................................

				/**
				 * Screening the stripper.
				 * @param {string} s1
				 * @param {string} s2
				 * @returns {string}
				 */
			},
			{
				key: '_stripout',
				value: function _stripout(script, s1, s2) {
					var first = s1[0] === '^';
					s1 = first ? s1.substring(1) : s1;

					if (script.includes(s1) && script.includes(s2)) {
						script = this._stripall(script, s1, s2, first);
					}

					return script;
				}
				/**
				 * Strip all comments with no concern about the context they appear in...
				 * @param {string} s1
				 * @param {string} s2
				 * @param {boolean} first
				 * @returns {string}
				 */
			},
			{
				key: '_stripall',
				value: function _stripall(script, s1, s2, first) {
					var WHITESPACE = /\s/;
					var a1 = s1.split(''),
						a2 = s2.split(''),
						c1 = a1.shift(),
						c2 = a2.pop();
					s1 = a1.join('');
					s2 = a2.join('');

					var chars = null,
						pass = false,
						next = false,
						fits = function fits(i, l, s) {
							return chars.slice(i, l).join('') === s;
						},
						ahead = function ahead(i, s) {
							var l = s.length;
							return fits(i, i + l, s);
						},
						prevs = function prevs(i, s) {
							var l = s.length;
							return fits(i - l, i, s);
						},
						begins = function begins(c, i) {
							var does = true;

							while (i > 0 && (c = script[--i]) !== '\n') {
								if (!c.match(WHITESPACE)) {
									does = false;
									break;
								}
							}

							return does;
						},
						start = function start(c, i) {
							var does = c === c1 && ahead(i + 1, s1);
							return does && first ? begins(c, i) : does;
						},
						stops = function stops(c, i) {
							return c === c2 && prevs(i, s2);
						};

					chars = script.split('');
					return chars
						.map(function(chaa, i) {
							if (pass) {
								if (stops(chaa, i)) {
									next = true;
								}
							} else {
								if (start(chaa, i)) {
									pass = true;
								}
							}

							if (pass || next) {
								chaa = '';
							}

							if (next) {
								pass = false;
								next = false;
							}

							return chaa;
						})
						.join('');
				}
			}
		]);

		return Stripper;
	})();

/**
 * Script runner. Iterating strings one character at a time
 * while using advanced algorithms to look ahead and behind.
 */

var Runner =
	/*#__PURE__*/
	(function() {
		/**
		 * Let's go.
		 */
		function Runner() {
			_classCallCheck(this, Runner);

			this.firstline = false;
			this.lastline = false;
			this.firstchar = false;
			this.lastchar = false;
			this._line = null;
			this._index = -1;
		}
		/**
		 * Run script.
		 * @param {Compiler} compiler
		 * @param {string} script
		 * @param {Status} status
		 * @param {Markup} markup
		 * @param {Output} output
		 */

		_createClass(Runner, [
			{
				key: 'run',
				value: function run(compiler, script, status, markup, output) {
					this._runlines(compiler, script.split('\n'), status, markup, output); // markup.debug(); // uncomment to debug Markup.js
				}
				/**
				 * Line text ahead equals given string?
				 * @param {string} string
				 * @returns {boolean}
				 */
			},
			{
				key: 'ahead',
				value: function ahead(string) {
					var line = this._line;
					var index = this._index;
					var i = index + 1;
					var l = string.length;
					return line.length > index + l && line.substring(i, i + l) === string;
				}
				/**
				 * Line text behind equals given string?
				 * @param {string} line
				 * @param {number} index
				 * @param {string} string
				 * @returns {boolean}
				 */
			},
			{
				key: 'behind',
				value: function behind(string) {
					var line = this._line;
					var index = this._index;
					var length = string.length,
						start = index - length;
					return start >= 0 && line.substr(start, length) === string;
				}
				/**
				 * Get line string from current position.
				 * @returns {string}
				 */
			},
			{
				key: 'lineahead',
				value: function lineahead() {
					return this._line.substring(this._index + 1);
				}
				/**
				 * Space-stripped line text at index equals string?
				 * @param {string} string
				 * @returns {boolean}
				 */
			},
			{
				key: 'skipahead',
				value: function skipahead(string) {
					console.error('TODO');
				} // Private ...................................................................

				/**
				 * Run all lines.
				 * @param {Compiler} compiler
				 * @param {Array<String>} lines
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_runlines',
				value: function _runlines(compiler, lines, status, markup, output) {
					var _this6 = this;

					var stop = lines.length - 1;
					lines.forEach(function(line, index) {
						_this6.firstline = index === 0;
						_this6.lastline = index === stop;

						_this6._runline(line, index, compiler, status, markup, output);
					});
				}
				/**
				 * Run single line.
				 * @param {string} line
				 * @param {number} index
				 * @param {Compiler} compiler
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_runline',
				value: function _runline(line, index, compiler, status, markup, output) {
					line = this._line = line.trim();

					if (line.length) {
						compiler.newline(line, this, status, markup, output);

						this._runchars(compiler, line.split(''), status, markup, output);

						compiler.endline(line, this, status, markup, output);
					}
				}
				/**
				 * Run all chars.
				 * @param {Compiler} compiler
				 * @param {Array<String>} chars
				 * @param {Status} status
				 * @param {Markup} markup
				 * @param {Output} output
				 */
			},
			{
				key: '_runchars',
				value: function _runchars(compiler, chars, status, markup, output) {
					var _this7 = this;

					var stop = chars.length - 1;
					chars.forEach(function(c, i) {
						_this7._index = i;
						_this7.firstchar = i === 0;
						_this7.lastchar = i === stop;
						compiler.nextchar(c, _this7, status, markup, output);
					});
				}
			}
		]);

		return Runner;
	})();

/**
 * Collapsing everything into a single function declaration.
 */

var Result =
	/*#__PURE__*/
	(function() {
		/**
		 * @param {string} body
		 * @param {Array<String>} params
		 * @param {Array<Instruction>} instructions
		 */
		function Result(body, params, instructions) {
			_classCallCheck(this, Result);

			this.functionstring = this._tofunctionstring(body, params);
			this.instructionset = instructions;
			this.errormessage = null;
		}
		/**
		 * Compute single function declaration.
		 * @param {string} script
		 * @param @optional (Array<String>} params
		 * @returns {string}
		 */

		_createClass(Result, [
			{
				key: '_tofunctionstring',
				value: function _tofunctionstring(body) {
					var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
					var js;

					try {
						js = "'use strict'\n;" + body;
						js = new Function(params.join(','), body).toString();
						js = js.replace(/^function anonymous/, 'function $edbml');
						js = js.replace(/\&quot;\&apos;/g, '&quot;');
						return js;
					} catch (exception) {
						this.instructionset = null;
						this.errormessage = exception.message;
						return this._tofallbackstring(body, params, exception.message);
					}
				}
				/**
				 * Fallback for invalid source.
				 * @param {string} script
				 * @param (Array<String>} params
				 * @returns {string}
				 */
			},
			{
				key: '_tofallbackstring',
				value: function _tofallbackstring(body, params, exception) {
					body = this._emergencyformat(body, params);
					body = new Buffer(body).toString('base64');
					body = "gui.BlobLoader.loadScript ( document, atob (  '" + body + "' ));\n";
					body += 'return \'<p class="edberror">' + exception + "</p>'";
					return this._tofunctionstring(body);
				}
				/**
				 * Format invalid source for readability.
				 * @param {string} body
				 * @returns {string}
				 */
			},
			{
				key: '_emergencyformat',
				value: function _emergencyformat(body, params) {
					var result = '',
						tabs = '\t',
						init = null,
						last = null,
						fixt = null,
						hack = null;
					body.split('\n').forEach(function(line) {
						line = line.trim();
						init = line[0];
						last = line[line.length - 1];
						fixt = line.split('//')[0].trim();
						hack = fixt[fixt.length - 1];

						if ((init === '}' || init === ']') && tabs !== '') {
							tabs = tabs.slice(0, -1);
						}

						result += tabs + line + '\n';

						if (last === '{' || last === '[' || hack === '{' || hack === '[') {
							tabs += '\t';
						}
					});
					return ['function dysfunction (' + params + ') {', result, '}'].join('\n');
				}
			}
		]);

		return Result;
	})();

/**
 * Tracking compiler state while compiling.
 */

var Status =
	/*#__PURE__*/
	(function() {
		function Status() {
			_classCallCheck(this, Status);

			this.mode = Status.MODE_JS;
			this.conf = [];
			this.peek = false;
			this.poke = false;
			this.cont = false;
			this.adds = false;
			this.func = null;
			this.conf = null;
			this.curl = null;
			this.skip = 0;
			this.last = 0;
			this.spot = 0;
			this.indx = 0;
		}
		/**
		 * Go JS mode.
		 */

		_createClass(Status, [
			{
				key: 'gojs',
				value: function gojs() {
					this.mode = Status.MODE_JS;
				}
				/**
				 * Go HTML mode.
				 */
			},
			{
				key: 'gohtml',
				value: function gohtml() {
					this.mode = Status.MODE_HTML;
				}
				/**
				 * Go tag mode.
				 */
			},
			{
				key: 'gotag',
				value: function gotag() {
					this.mode = Status.MODE_TAG;
				}
				/**
				 * Is JS mode?
				 * @returns {boolean}
				 */
			},
			{
				key: 'isjs',
				value: function isjs() {
					return this.mode === Status.MODE_JS;
				}
				/**
				 * Is HTML mode?
				 * @returns {boolean}
				 */
			},
			{
				key: 'ishtml',
				value: function ishtml() {
					return this.mode === Status.MODE_HTML;
				}
				/**
				 * Is tag mode?
				 * @returns {boolean}
				 */
			},
			{
				key: 'istag',
				value: function istag() {
					return this.mode === Status.MODE_TAG;
				}
			}
		]);

		return Status;
	})(); // Static ...............................

Status.MODE_JS = 'js';
Status.MODE_HTML = 'html';
Status.MODE_TAG = 'tag';
/**
 * Tracking the state of
 * markup while compiling.
 */

var Markup =
	/*#__PURE__*/
	(function() {
		function Markup() {
			_classCallCheck(this, Markup);

			this.tag = null; // current tagname (if applicable)

			this.att = null; // current attname (not maintained!)

			this._is = null;
			this._buffer = null;
			this._quotes = null;
			this._snapshots = [];
			this._index = -1;

			this._go('txt');
		}

		_createClass(Markup, [
			{
				key: 'next',
				value: function next(c) {
					this._index++;

					switch (c) {
						case '<':
						case '>':
							this._ontag(c);

							break;

						case ' ':
							this._onspace(c);

							break;

						case '=':
							this._onequal(c);

							break;

						case '"':
						case "'":
							this._onquote(c);

							break;

						default:
							this._buf(c);

							break;
					}

					this._prevchar = c;
					return this._is;
				}
				/**
				 * Log snapshots to console (for debugging purpose).
				 * You can call this method over in class Runner.js
				 */
			},
			{
				key: 'debug',
				value: function debug() {
					this._debug(this._snapshots);
				} // Private ...................................................................

				/**
				 * Tag chars.
				 * @param {string} c
				 */
			},
			{
				key: '_ontag',
				value: function _ontag(c) {
					if (c === '<') {
						if (this._is === 'txt') {
							this.tag = null;

							this._go('tag');
						}
					} else {
						if (this._is === 'tag') {
							this.tag = this._buffer.trim();
						}

						switch (this._is) {
							case 'att':
							case 'tag':
								this.tag = null;

								this._go('txt');

								break;
						}
					}
				}
				/**
				 * Quote chars. We may assume the author to use double
				 * quotes, single quotes and no quotes for attributes.
				 * @param {string} c
				 */
			},
			{
				key: '_onquote',
				value: function _onquote(c) {
					var previndex = this._index - 1;

					switch (this._is) {
						case 'val':
							if (this._quotes) {
								if (this._quotes === c && this._prevchar !== '\\') {
									this._go('att');
								}
							} else if (this._was(previndex, 'att')) {
								this._quotes = c;
							}

							break;

						default:
							this._buf(c);

							break;
					}
				}
				/**
				 * Space chars.
				 * TODO: Important: All sorts of (multiple) whitespace characters going on!
				 * @param {string} c
				 */
			},
			{
				key: '_onspace',
				value: function _onspace(c) {
					switch (this._is) {
						case 'tag':
							this.tag = this._buffer.trim();

							this._go('att');

							break;

						case 'val':
							if (!this._quotes) {
								this._go('att');
							}

							break;

						default:
							this._buf(c);

							break;
					}
				}
				/**
				 * Equal sign.
				 * @param {string} c
				 */
			},
			{
				key: '_onequal',
				value: function _onequal(c) {
					if (this._is === 'att') {
						this._go('val');
					} else {
						this._buf(c);
					}
				}
				/**
				 * Buffer char.
				 * @param {string} c
				 */
			},
			{
				key: '_buf',
				value: function _buf(c) {
					this._buffer += c;
				}
				/**
				 * Take snapshot, clear the buffer and change to new mode.
				 * @param {string} newis
				 */
			},
			{
				key: '_go',
				value: function _go(newis) {
					if (this._is !== null) {
						this._snapshots.push([this._index, this._is, this._buffer]);
					}

					this._quotes = null;
					this._buffer = '';
					this._is = newis;
				}
				/**
				 * Was type at index?
				 * @param {number} index
				 * @param {string} type
				 */
			},
			{
				key: '_was',
				value: function _was(index, type) {
					var ix,
						it,
						match,
						snap,
						prev,
						snaps = this._snapshots;

					if (snaps.length) {
						it = snaps.length - 1;

						while (!match && (snap = snaps[it--])) {
							if ((ix = snap[0]) === index) {
								match = snap;
							} else if (ix < index) {
								match = prev;
							}

							prev = snap;
						}

						return match && match[1] === type;
					}

					return false;
				} // Deboogie ..................................................................

				/**
				 * Quick and dirty debugging: The string
				 * in the console should look like HTML.
				 * @param {Array<Array<string>>} snapshots
				 */
			},
			{
				key: '_debug',
				value: function _debug(snapshots) {
					var index,
						is,
						was,
						buffer,
						yyy,
						next,
						end,
						tab = '\t',
						tabs = [];
					console.log(
						snapshots.reduce(function(html, snap) {
							index = snap[0];
							is = snap[1];
							buffer = snap[2];

							switch (is) {
								case 'tag':
									if ((end = buffer[0] === '/')) {
										tabs.pop();
									}

									was = was === 'txt' && yyy.trim().length ? '' : was;
									next = (was ? '\n' + tabs.join('') : '') + '<' + buffer;

									if (!end) {
										tabs.push(tab);
									}

									break;

								case 'att':
									next = ' ' + buffer.trim();

									if (next === ' ') {
										next = '';
									}

									break;

								case 'val':
									next = '="' + buffer + '"';
									break;

								case 'txt':
									next = (was ? '>' : '') + buffer;
									break;
							}

							was = is;
							yyy = buffer;
							return html + next;
						}, '') + (was === 'tag' ? '>' : '')
					);
				}
			}
		]);

		return Markup;
	})(); // Static ......................................................................

Markup.CONTEXT_TXT = 'txt';
Markup.CONTEXT_ATT = 'att';
Markup.CONTEXT_VAL = 'val';
/**
 * Collecting JS code.
 */

var Output =
	/**
	 * @param @optional {string} body
	 */
	function Output() {
		var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

		_classCallCheck(this, Output);

		this.body = body;
		this.temp = null;
	};

/**
 * @param {string} source
 * @param {Map<String,object>} options
 * @param {???} macros
 * @param {Map<String,object>} directives
 * @returns {string}
 */

exports.compile = function(edbml, options, macros, directives) {
	if (edbml.includes('<?input')) {
		return new ScriptCompiler().compile(edbml, options, macros, directives);
	} else {
		return new FunctionCompiler().compile(edbml, options, macros, directives);
	}
};
