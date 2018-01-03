/**
 * From Raganwalds "Method Combinators".
 * @see https://github.com/raganwald/method-combinators/blob/master/README-JS.md
 * @see https://github.com/raganwald/homoiconic/blob/master/2012/09/precondition-and-postcondition.md
 */
gui.Combo = {
	/**
	 * Decorate function before.
	 * @param {function} decoration
	 * @returns {function}
	 */
	before: function(decoration) {
		return function(base) {
			return function() {
				decoration.apply(this, arguments);
				return base.apply(this, arguments);
			};
		};
	},

	/**
	 * Decorate function after.
	 * @param {function} decoration
	 * @returns {function}
	 */
	after: function(decoration) {
		return function(base) {
			return function() {
				var result = base.apply(this, arguments);
				decoration.apply(this, arguments);
				return result;
			};
		};
	},

	/**
	 * Decorate function around.
	 * @param {function} decoration
	 * @returns {function}
	 */
	around: function(decoration) {
		var slice = [].slice;
		return function(base) {
			return function() {
				var argv,
					callback,
					result,
					that = this;
				argv = arguments.length >= 1 ? slice.call(arguments, 0) : [];
				result = void 0;
				callback = function() {
					result = base.apply(that, argv);
					return result;
				};
				decoration.apply(this, [callback].concat(argv));
				return result;
			};
		};
	},

	/**
	 * Decorate function provided with support for an otherwise operation.
	 * @param {function} condition
	 */
	provided: function(condition) {
		return function(base, otherwise) {
			return function() {
				if (condition.apply(this, arguments)) {
					return base.apply(this, arguments);
				} else if (otherwise) {
					return otherwise.apply(this, arguments);
				}
			};
		};
	},

	/**
	 * Make function return `this` if otherwise it would return `undefined`.
	 * Variant of the `fluent` combinator which would always returns `this`.
	 * We use this extensively to ensure API consistency, but we might remove
	 * it for a theoretical performance gain once we have a huge test suite.
	 * @param {function} base
	 * @returns {function}
	 */
	chained: function(base) {
		return function() {
			var result = base.apply(this, arguments);
			return result === undefined ? this : result;
		};
	},

	/**
	 * Memoize return value for function that take zero or more
	 * args, each of which must be amenable to JSON.stringify.
	 * @param {function} base
	 * @returns {function}
	 */
	memoized: function(base) {
		var memos;
		memos = {};
		return function() {
			var key;
			key = JSON.stringify(arguments);
			if (memos.hasOwnProperty(key)) {
				return memos[key];
			} else {
				memos[key] = base.apply(this, arguments);
				return memos[key];
			}
		};
	},

	/**
	 * Simply output the input. Wonder what it could be.
	 * @param {object} subject
	 * @return {object}
	 */
	identity: function(subject) {
		return subject;
	}
};
