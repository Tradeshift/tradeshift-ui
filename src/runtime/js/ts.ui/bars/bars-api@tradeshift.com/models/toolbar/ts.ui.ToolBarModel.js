/**
 * Advanced toolbar model.
 * @extends {ts.ui.BarModel}
 */
ts.ui.ToolBarModel = (function using(chained) {

	return ts.ui.BarModel.extend({

		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'toolbar',
		
		/**
		 * Has tabs or buttons or anything at all really?
		 * @type {boolean}
		 */
		hascontent: false,

		/**
		 * Base background color (which also affects tabs and button color).
		 * @type {string}
		 */
		color: ts.ui.CLASS_BG_LITE,

		/**
		 * Toolbar title (or statusbar message).
		 * @type {string}
		 */
		title: null,
		
		/** 
		 * Toolbar search model.
		 * @type {ts.ui.InputModel}
		 */
		search: null,

		/**
		 * @type {ts.ui.PagerModel}
		 */
		pager: null,

		/**
		 * Render as statusbar?
		 * @type {boolean}
		 */
		statusbar: false,
		
		/**
		 * Attempt to economize space by automatically transferring 
		 * any assigned buttons (especially tertiary) into an Aside?
		 * @type {boolean}
		 */
		 compact: true,

		/**
		 * Tabs.
		 * @type {ts.ui.TabCollection}
		 */
		tabs: ts.ui.TabCollection,

		/**
		 * Toolbar button collection.
		 * @type {ts.ui.ButtonCollection<ts.ui.ButtonModel>}
		 */
		buttons: ts.ui.ButtonCollection,

		/**
		 * Newup defaults.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.buttons = this.buttons || [];
			this.tabs = this.tabs || [];
			this._watchmodels(true);
			this._updatehascontent();
		},

		/**
		 * Don't observe tabs and buttons.
		 * TODO: Automate this step :/
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this._watchmodels(false);
		},

		/**
		 * Handle model changes.
		 * @param {Array<edb.Change>} changes
		 * @returns {boolean} True when updated
		 */
		onchange: function(changes) {
			var splice = edb.ArrayChange.TYPE_SPLICE;
			if(changes.some(function(c) {
				return c.type === splice || c.name === 'title';
			})) {
				this._updatehascontent();
				return true;
			}
			return false;
		},

		/**
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.toolbar.edbml(this);
		},

		// Private .................................................................

		/**
		 * Watch myself and my collections.
		 * TODO: {TopBarModel} must add `navigation` to this list !!!!!!!!!!!!!!!!!!
		 * @param {boolean} doit
		 */
		_watchmodels: function(doit) {
			[this, this.buttons, this.tabs].forEach(function(model) {
				if(doit) {
					model.addObserver(this);
				} else {
					model.removeObserver(this);
				}
			}, this);
		},

		/**
		 * Compute the property `hascontent` so that others 
		 * won't have to remember this long list of checks.
		 * @returns {boolean} True when there's content...
		 */
		_updatehascontent: function() {
			this.hascontent = !!(
				this.tabs.length || 
				this.buttons.length || 
				this.title 
			);
			return this.hascontent;
		}

	});
}(gui.Combo.chained));
