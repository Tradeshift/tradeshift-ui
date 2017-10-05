/**
 *
 */
ts.dox.PrismSpirit = (function() {
	return ts.ui.BoxSpirit.extend({
		/**
		 * Source code (encoded via encodeURIComponent).
		 * This get's set in the HTML by some Grunt task.
		 * @type {string}
		 */
		code: '',

		/**
		 * Decode the code. Perhaps this should be lazy?
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.code = decodeURIComponent(this.code);
			this._parseinput(this.dom.q('input[type=hidden]'));
		},

		// Private ...................................................................

		/**
		 * @param {HTMLInputElement} input
		 */
		_parseinput: function(input) {
			if (input) {
				this._parseconfig(JSON.parse(decodeURIComponent(input.value)));
			}
		},

		/**
		 * Prepare the toolbar (for subclass to refine).
		 * @param {Object} config
		 */
		_parseconfig: function(config) {
			if (config.show) {
				this._head().uncompact();
			}
		}
	});
})();
