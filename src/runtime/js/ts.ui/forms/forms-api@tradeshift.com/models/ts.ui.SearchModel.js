/**
 * Advanced search model (as used in the ToolBar component).
 * @extends {ts.ui.InputModel}
 */
ts.ui.SearchModel = ts.ui.InputModel.extend({
	
	/**
	 * Friendly name.
	 * @type {string}
	 */
	item: 'search',

	/**
	 * Input type.
	 * @type {string}
	 */
	type: 'search',

	/**
	 * Placeholder and title (tooltip) string.
	 * @type {string}
	 */
	tip: null,

	/**
	 * Render as "inset" (via classname `ts-inset`)?
	 * @type {boolean}
	 */
	inset: false,

	/**
	 * Open for implementation: Function to call when user presses ENTER.
	 * NOTE: This is coded in a way that doesn't work xframe (greenfield).
	 * @type {function}
	 * @param {string} value
	 */
	onsearch: null,

	/**
	 * Clear value and invoke appropriate callback.
	 */
	clear: function() {
		this.super.clear();
		this._bestcallback(this.value);
	},
	
	/**
	 * Invoke appropriate callback on ENTER.
	 * @param {string} value
	 */
	onenterkey: function() {
		this._bestcallback(this.value);
	},
 
	/** 
	 * Bounce model to HTML.
	 * @param @optional {boolean} toolbar (temp cornercase!)
	 * @overrides {ts.ui.InputModel#render}
	 * @returns {string}
	 */
	render: function(toolbar) {
		return ts.ui.search.edbml(this);
	},


	// Private ...................................................................

	/** 
	 * Call `onsearch` if defined, otherwise call `onidle` (if defined).
	 * @param {string} value
	 */
	_bestcallback: function(value) {
		if(!this._maybeinvoke(this.onsearch, value)) {
			this._maybeinvoke(this.onidle, value);
		}
	}

});
