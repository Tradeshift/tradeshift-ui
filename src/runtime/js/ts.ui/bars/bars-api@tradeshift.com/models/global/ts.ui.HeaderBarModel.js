/**
 * Advanced header model.
 * @using {ts.ui.ToolBarModel} ToolBarModel
 * @using {ts.ui.SearchBarModel} SearchModel
 * @using {gui.Combo#chained} chained
 */
ts.ui.HeaderBarModel = (function using(ToolBarModel, SearchModel, chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'header',

		/**
		 * This is not used just yet!
		 * @type {ts.ui.ToolBarModel}
		 */
		bufferbar: ToolBarModel,

		/**
		 * @type {ts.ui.ToolBarModel}
		 */
		headerbar: ToolBarModel,

		/**
		 * @type {ts.ui.ToolBarModel}
		 */
		centerbar: ToolBarModel,

		/**
		 * @type {ts.ui.ToolBarModel}
		 */
		buttonbar: ToolBarModel,

		/**
		 * Initialize models.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.headerbar = {};
			this.centerbar = {};
			this.buttonbar = {};
		},

		/**
		 * The title.
		 * @type {string}
		 */
		title: {
			getter: function() {
				return this.headerbar.title;
			},
			setter: function(title) {
				this.headerbar.title = title;
			}
		},

		/**
		 * TODO: should we even support this stuff?
		 * @type {string}
		 */
		icon: {
			getter: function() {
				return this.headerbar.icon;
			},
			setter: function(icon) {
				this.headerbar.icon = icon;
			}
		},

		/**
		 * The color
		 * @type {string}
		 */
		color: {
			getter: function() {
				return this.headerbar.color;
			},
			setter: function(color) {
				this.headerbar.color = color;
			}
		},

		/**
		 * The buttons.
		 * @type {ts.ui.ButtonCollection}
		 */
		buttons: {
			getter: function() {
				return this.headerbar.buttons;
			},
			setter: function(json) {
				this.headerbar.buttons = json;
			}
		},

		/**
		 * The tabs.
		 * @type {ts.ui.TabCollection}
		 */
		tabs: {
			getter: function() {
				return this.centerbar.tabs;
			},
			setter: function(json) {
				this.centerbar.tabs = json;
			}
		},

		/**
		 * The search.
		 * @type {ts.ui.SearchModel}
		 */
		search: {
			getter: function() {
				return this.buttonbar.search;
			},
			setter: function(json) {
				if (json !== null) {
					json = SearchModel.from(json);
					json.inset = true;
				}
				this.buttonbar.search = json;
			}
		},

		/**
		 * The dedicated burger button.
		 * @param {Function|null} onclick
		 * @returns {this|ts.ui.ButtonModel}
		 */
		burgerbutton: chained(function(onclick) {
			return this._specialbutton(this.headerbar, 'burgerbutton', onclick);
		}),

		/**
		 * The dedicated settings button.
		 * @param {Function|null} onclick
		 * @returns {this|ts.ui.ButtonModel}
		 */
		settingsbutton: chained(function(onclick) {
			return this._specialbutton(this.headerbar, 'configbutton', onclick);
		}),

		/**
		 * The dedicated support button.
		 * @param {Function|null} onclick
		 * @returns {this|ts.ui.ButtonModel}
		 */
		supportbutton: chained(function(onclick) {
			return this._specialbutton(this.headerbar, 'helpbutton', onclick);
		}),

		/**
		 * The dedicated back button.
		 * @param {Function|null} onclick
		 * @returns {this|ts.ui.ButtonModel}
		 */
		backbutton: chained(function(onclick) {
			return this._specialbutton(this.headerbar, 'backbutton', onclick);
		}),

		/**
		 * The dedicated forward button.
		 * @param {Function|null} onclick
		 * @returns {this|ts.ui.ButtonModel}
		 */
		forwardbutton: chained(function(onclick) {
			return this._specialbutton(this.headerbar, 'forwardbutton', onclick);
		}),

		// Privileged ..............................................................

		/**
		 * @returns {ts.ui.ButtonModel|undefined}
		 */
		_specialbutton: function(bar, button, onclick) {
			if (onclick === null) {
				bar[button] = null;
			} else if (onclick) {
				bar[button] = {
					onclick: onclick
				};
			} else {
				return bar[button];
			}
		},

		/**
		 * Show any bars at all (although this method is not really used anywhere)?
		 * @returns {boolean}
		 */
		$show: function() {
			return (
				this.$showHeaderBar(this.actionbar) ||
				this.$showCenterBar(this.centerbar) ||
				this.$showButtonBar(this.backupbar)
			);
		},

		/**
		 * Should show the title bar? Hardcoded for now. Called from EDBML.
		 * TODO: We'll need to post the default app title down from the chrome!
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showHeaderBar: function(model) {
			return true; // !!(model.title);
		},

		/**
		 * Should show the tabs bar? Called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showCenterBar: function(model) {
			return !!model.tabs.getLength();
		},

		/**
		 * Should show the toolbar? Called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showButtonBar: function(model) {
			return !!(model.search && model.search.visible);
		}
	});
})(ts.ui.ToolBarModel, ts.ui.SearchModel, gui.Combo.chained);
