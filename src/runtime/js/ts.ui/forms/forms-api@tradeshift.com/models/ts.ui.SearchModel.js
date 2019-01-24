/**
 * Advanced search model (as used in the ToolBar component).
 * @extends {ts.ui.InputModel}
 * @using {Constructor<ts.ui.InputModel>} InputModel
 * @using {Constructor<ts.ui.ButtonCollection>} ButtonCollection
 * @using {gui.Combo#chained} chained
 */
ts.ui.SearchModel = (function(InputModel, ButtonCollection, chained) {
	/**
	 * Stamp the buttons with a reference to the search.
	 * @param {ts.ui.ButtonCollection} buttons
	 * @param {ts.ui.SearchModel} search
	 */
	function stamp(buttons, search) {
		buttons.forEach(function(button) {
			button.search = search;
		});
	}

	return InputModel.extend({
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
		 * Buttons related to search. These may not always be rendered: When
		 * the Search is used standalone, they get ignored. When the Search
		 * is in the Header, they will be rendered as part of the searchbar.
		 * @type {ts.ui.ButtonCollection}
		 */
		buttons: ButtonCollection,

		/**
		 * Stretch to fill the space? Support
		 * for this depends on the use case.
		 * @type {number} (treated as truthy for now)
		 */
		flex: 0,

		/**
		 * Search is visible? Changing this is not universally supported.
		 * @type {boolean}
		 */
		visible: true,

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
				console.warn('SearchModel.tip: Deprecated API is deprecated. Please use `info`');
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
		 * Default create the buttons and stamp them with a reference to this model.
		 * We'll need to observer the collection to repeat the trick for new buttons.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			stamp((this.buttons = this.buttons || []), this);
			this.buttons.addObserver(this);
		},

		/**
		 * Stamp the buttons with a reference to the SearchModel (this SearchModel).
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			var buttons = this.buttons;
			var splice = edb.ArrayChange.TYPE_SPLICE;
			changes
				.filter(function(c) {
					return c.type === splice && c.object === buttons;
				})
				.forEach(function(c) {
					stamp(c.added, this);
				}, this);
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

		/**
		 * Search now!
		 * @returns {this}
		 */
		search: chained(function() {
			this._bestcallback(this.value);
		}),

		/**
		 * Intend to hide the search. This is not guaranteed to work in all cases!
		 * @returns {this}
		 */
		hide: chained(function() {
			this.visible = false;
		}),

		/**
		 * Show the search.
		 * @returns {this}
		 */
		show: chained(function() {
			this.visible = true;
		}),

		// Private ...................................................................

		/**
		 * Call `onsearch` if defined, otherwise call `onidle` (if defined).
		 * @param {string} value
		 */
		_bestcallback: function(value) {
			if (!this._maybeinvoke(this.onsearch, value)) {
				this._maybeinvoke(this.onidle, value);
			}
		}
	});
})(ts.ui.InputModel, ts.ui.ButtonCollection, gui.Combo.chained);
