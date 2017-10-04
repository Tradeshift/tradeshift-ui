/**
 * @using {gui.DOMPlugin} DOMPlugin
 * @using {ts.ui.MainSpirit} MainSpirit
 */
ts.ui.Bar = (function using(DOMPlugin, MainSpirit) {
	return gui.Class.create(
		Object,
		{
			/**
			 * Associate this instance to Main component of given ordinal index.
			 * @param {number} index
			 */
			onconstruct: function(index) {
				this._main = DOMPlugin.qall(document, '.ts-main', MainSpirit)[index];
			},

			/**
			 * Subclass must implement! Get the ToolBarSpirit (via the
			 * Main component that this instance has been associated to).
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			$getbar: function() {}
		},
		{
			// Xstatic ..............................................................

			/**
			 * Get Bar instance by index of associated Main.
			 * This will be created if it doesn't yet exist.
			 * @returns {ts.ui.Bar}
			 */
			get: function(index) {
				var Bar = this,
					all = this.$bars;
				return all[index] || (all[index] = new Bar(index));
			},

			/**
			 * Apply method to the Bar instance associated to the first Main.
			 * Make sure that chained returns this (constructor, not instance).
			 * @returns {ts.ui.Bar}
			 */
			first: function(method, args) {
				var bar = this.get(0);
				var res = bar[method].apply(bar, args);
				return ts.ui.Bar.is(res) ? this : res;
			}
		},
		{
			// Static ...............................................................

			/**
			 * Listing Bar instances.
			 * @type {Array<ts.ui.Bar>}
			 */
			$bars: [],

			/**
			 * Generate methods to go on the Bar prototype (instance methods).
			 * @param {Array<string>} names
			 * @returns {Object<string, Function>}
			 */
			$protomethods: function(names) {
				var protos = Object.create(null);
				names.forEach(function(name) {
					protos[name] = this.$protomethod(name);
				}, this);
				return protos;
			},

			/**
			 * Generate methods to go on the Bar constructor (static methods).
			 * @param {Array<string>} names
			 * @returns {Object}
			 */
			$staticmethods: function(names) {
				var statix = Object.create(null);
				names.forEach(function(name) {
					statix[name] = this.$staticmethod(name);
				}, this);
				return statix;
			},

			/**
			 * Generate single instance method.
			 * @param {string} name
			 * @returns {Function}
			 */
			$protomethod: function(name) {
				return function() {
					var bar = this.$getbar();
					var res = bar[name].apply(bar, arguments);
					return ts.ui.Spirit.is(res) ? this : res;
				};
			},

			/**
			 * Generate single static method.
			 * @param {string} name
			 * @returns {Function}
			 */
			$staticmethod: function(name) {
				return function() {
					return this.first(name, arguments);
				};
			}
		}
	);
})(gui.DOMPlugin, ts.ui.MainSpirit);
