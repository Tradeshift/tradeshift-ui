/**
 * Polyfilling missing features from ES5 and selected features from ES6.
 * Some of these are implemented weakly and should be used with caution
 * (See Map, Set and WeakMap).
 * TODO: Remove Set, Map and WeakMap!
 * TODO: Object.is and friends
 */
(function polyfilla() {
	/**
	 * Extend one object with another.
	 * @param {object} what Native prototype
	 * @param {object} whit Extension methods
	 */
	function extend(what, whit) {
		Object.keys(whit).forEach(function(key) {
			var def = whit[key];
			if (what[key] === undefined) {
				if (def.get && def.set) {
					// TODO: look at element.dataset polyfill (iOS?)
				} else {
					what[key] = def;
				}
			}
		});
	}

	/**
	 * Patching `String.prototype`
	 */
	function strings() {
		extend(String.prototype, {
			trim: function() {
				return this.trimLeft().trimRight();
			},
			trimRight: function() {
				return this.replace(/\s+$/, '');
			},
			trimLeft: function() {
				return this.replace(/^\s*/, '');
			},
			repeat: function(n) {
				return new Array(n + 1).join(this);
			},
			startsWith: function(sub) {
				return this.indexOf(sub) === 0;
			},
			endsWith: function(sub) {
				sub = String(sub);
				var i = this.lastIndexOf(sub);
				return i >= 0 && i === this.length - sub.length;
			},
			contains: function() {
				// they changed it :/
				console.warn(
					'String.prototype.contains is deprecated. You can use String.prototype.includes'
				);
				return this.includes.apply(this, arguments);
			},
			includes: function() {
				return String.prototype.indexOf.apply(this, arguments) !== -1;
			},
			toArray: function() {
				return this.split('');
			}
		});
	}

	/**
	 * Patching arrays.
	 */
	function arrays() {
		extend(Array.prototype, {
			find: function(predicate) {
				if (this === null) {
					throw new TypeError('Array.prototype.find called on null or undefined');
				}
				if (typeof predicate !== 'function') {
					throw new TypeError('predicate must be a function');
				}
				var list = Object(this);
				var length = list.length >>> 0;
				var thisArg = arguments[1];
				var value;
				for (var i = 0; i < length; i++) {
					value = list[i];
					if (predicate.call(thisArg, value, i, list)) {
						return value;
					}
				}
				return undefined;
			}
		});
		extend(Array, {
			every: function every(array, fun, thisp) {
				var res = true,
					len = array.length >>> 0;
				for (var i = 0; i < len; i++) {
					if (array[i] !== undefined) {
						if (!fun.call(thisp, array[i], i, array)) {
							res = false;
							break;
						}
					}
				}
				return res;
			},
			forEach: function forEach(array, fun, thisp) {
				var len = array.length >>> 0;
				for (var i = 0; i < len; i++) {
					if (array[i] !== undefined) {
						fun.call(thisp, array[i], i, array);
					}
				}
			},
			map: function map(array, fun, thisp) {
				var m = [],
					len = array.length >>> 0;
				for (var i = 0; i < len; i++) {
					if (array[i] !== undefined) {
						m.push(fun.call(thisp, array[i], i, array));
					}
				}
				return m;
			},
			filter: function map(array, fun, thisp) {
				return Array.prototype.filter.call(array, fun, thisp);
			},
			isArray: function isArray(o) {
				return Object.prototype.toString.call(o) === '[object Array]';
			},
			concat: function(a1, a2) {
				function map(e) {
					return e;
				}
				return this.map(a1, map).concat(this.map(a2, map));
			}
		});
	}

	/**
	 * Patching `Function.prototype` (something about iOS)
	 */
	function functions() {
		extend(Function.prototype, {
			bind: function bind(oThis) {
				if (typeof this !== 'function') {
					throw new TypeError('Function bind not callable');
				}
				var fSlice = Array.prototype.slice,
					aArgs = fSlice.call(arguments, 1),
					fToBind = this,
					Fnop = function() {},
					fBound = function() {
						return fToBind.apply(
							this instanceof Fnop ? this : oThis || window,
							aArgs.concat(fSlice.call(arguments))
						);
					};
				Fnop.prototype = this.prototype;
				fBound.prototype = new Fnop();
				return fBound;
			}
		});
	}

	/**
	 * TODO: investigate support for Object.getPrototypeOf(window)
	 */
	function globals() {
		extend(window, {
			console: {
				log: function() {},
				debug: function() {},
				warn: function() {},
				error: function() {}
			}
		});
	}

	/**
	 * Patching cheap DHTML effects with super-simplistic polyfills.
	 * TODO: use MessageChannel pending moz bug#677638
	 * @see http://www.nonblocking.io/2011/06/windownexttick.html
	 * @param [Window} win
	 */
	function effects() {
		extend(window, {
			requestAnimationFrame: (function() {
				var func =
					window.requestAnimationFrame ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					(function() {
						var lastTime = 0;
						return function(callback, element) {
							var currTime = new Date().getTime();
							var timeToCall = Math.max(0, 16 - (currTime - lastTime));
							var id = window.setTimeout(function() {
								// eslint-disable-next-line standard/no-callback-literal
								callback(currTime + timeToCall);
							}, timeToCall);
							lastTime = currTime + timeToCall;
							return id;
						};
					})();
				return func;
			})(),
			cancelAnimationFrame: (function() {
				return (
					window.cancelAnimationFrame ||
					window.webkitCancelAnimationFrame ||
					window.mozCancelAnimationFrame ||
					window.oCancelAnimationFrame ||
					window.msCancelAnimationFrame ||
					clearTimeout
				);
			})(),
			/*
			 * TODO: Internalize into gui.Tick
			 * TODO: Move to MessageChannel!!!
			 */
			setImmediate: (function() {
				var list = [],
					handle = 1;
				var name = 'spiritual:emulated:setimmediate';
				window.addEventListener(
					'message',
					function(e) {
						if (e.data === name && list.length) {
							list.shift().apply(window);
							e.stopPropagation();
						}
					},
					false
				);
				return function emulated(func) {
					list.push(func);
					window.postMessage(name, '*');
					return handle++;
				};
			})()
		});
	}

	/**
	 * Alias methods plus IE and Safari mobile patches.
	 */
	function extras() {
		extend(console, {
			debug: console.log
		});
		extend(XMLHttpRequest.prototype, {
			overrideMimeType: function() {}
		});
		extend(XMLHttpRequest, {
			UNSENT: 0,
			OPENED: 1,
			HEADERS_RECEIVED: 2,
			LOADING: 3,
			DONE: 4
		});
	}

	/**
	 * Skip selected polyfills in worker context.
	 */
	(function fill(isWorker) {
		strings();
		arrays();
		functions();
		globals();
		extras();
		if (!isWorker) {
			effects();
		}
	})(false);
})();
