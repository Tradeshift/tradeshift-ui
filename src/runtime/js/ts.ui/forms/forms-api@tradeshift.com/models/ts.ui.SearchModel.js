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
	 * TODO: Rename this to info (to conform with ButtonModel)
	 * @type {string}
	 */
	info: null,

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
	 * Stretch to fill the space? Support 
	 * for this depends on the use case.
	 * @type {number} (treated as truthy for now)
	 */
	flex: 0,
	
	/**
	 * @deprecated
	 * @type {string}
	 */
	tip: {
		getter: function() {
			return this.info;
		},
		setter: function(value) {
			this.info = value;
		}
	},
	
	/**
	 * TODO: Completely wipe this this property after some releases.
	 */
	onconstruct: function() {
		this.super.onconstruct();
		if(this.tip) {
			this.info = this.tip;
			console.warn(
				'SearchModel.tip: Deprecated API is deprecated. Please use `info`'
			);
		}
	},

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
