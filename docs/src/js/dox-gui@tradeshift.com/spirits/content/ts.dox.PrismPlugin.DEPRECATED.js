ts.dox.PrismPlugin = ts.ui.Plugin.extend({
	/**
	 * Source code (encoded via encodeURIComponent).
	 * This get's set in the HTML by some Grunt task.
	 * @type {string}
	 */
	code: '',

	/**
	 * Decode the code. Perhaps this should be lazy?
	 */
	init: function(code) {
		code = decodeURIComponent(this.code);
		this._parseinput(this.dom.q('input[type=hidden]'));
		// this.super.onconstruct();
		// this.code = decodeURIComponent(this.spirit.code);
		// this._parseinput(this.spirit.dom.q('input[type=hidden]'));
		// alert(this.code);
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
	 * @param {Object} config
	 */
	_parseconfig: function(config) {
		if (config.show) {
			this._toolbar = this.dom.prepend(ts.ui.ToolBarSpirit.summon());
			this._toolbar.css.add('ts-micro');
			this._toolbar.uncompact();
		}
	}
});
