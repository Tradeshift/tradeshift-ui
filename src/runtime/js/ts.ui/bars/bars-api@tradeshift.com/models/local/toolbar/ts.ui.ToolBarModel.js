/**
 * Advanced toolbar model.
 * @extends {ts.ui.BarModel}
 * @using {gui.Combo#chained} chained
 * @using {Class<ts.ui.ButtonModel} ButtonModel
 * @using {Class<ts.ui.CheckBoxModel} CheckBoxModel
 */
ts.ui.ToolBarModel = (function using(chained, ButtonModel, CheckBoxModel) {
	/**
	 * @param {Object|null} json
	 * @param {string} icon
	 * @returns {ButtonModel|null}
	 */
	function specialbutton(json, icon) {
		if (json) {
			json = ButtonModel.from(json);
			json.type = 'ts-tertiary ts-noborder';
			json.icon = icon;
		}
		return json;
	}

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
		 * Has now or has ever had tabs or buttons and stuf?
		 * @type {boolean}
		 */
		hadcontent: false,

		/**
		 * Base background color (which also affects tabs and button color).
		 * @type {string}
		 */
		color: ts.ui.CLASS_BG_LITE,

		/**
		 * Toolbar title.
		 * @type {string}
		 */
		title: null,

		/**
		 * Toolbar icon.
		 * @type {string}
		 */
		icon: null,

		/**
		 * Toolbar status.
		 * @type {string}
		 */
		status: null,

		/**
		 * Toolbar search model.
		 * @type {ts.ui.InputModel}
		 */
		search: null,

		/**
		 * Attempt to economize space by automatically transferring
		 * any assigned buttons (especially tertiary) into an Aside?
		 * @type {boolean}
		 */
		compact: true,

		/**
		 * Status message may contain links?
		 * @type {boolean}
		 */
		linkable: false,

		/**
		 * Tabs.
		 * @type {ts.ui.TabCollection}
		 */
		tabs: ts.ui.TabCollection,

		/**
		 * Toolbar actions collection.
		 * @type {ts.ui.ActionCollection<ts.ui.ButtonModel>}
		 */
		actions: ts.ui.ActionCollection,

		/**
		 * Toolbar button collection.
		 * @type {ts.ui.ButtonCollection<ts.ui.ButtonModel>}
		 */
		buttons: ts.ui.ButtonCollection,

		/**
		 * Reserved for the config button as seen in the Table footer.
		 * @type {ts.ui.ButtonModel}
		 */
		configbutton: {
			getter: function() {
				return this.actualconfigbutton;
			},
			setter: function(json) {
				this.actualconfigbutton = specialbutton(json, 'ts-icon-settings');
			}
		},

		helpbutton: {
			getter: function() {
				return this.actualhelpbutton;
			},
			setter: function(json) {
				this.actualhelpbutton = specialbutton(json, 'ts-icon-support');
			}
		},

		/**
		 * Reserved for the closing "X" in Aside headers and so forth.
		 * @type {ts.ui.ButtonModel}
		 */
		closebutton: {
			getter: function() {
				return this.actualclosebutton;
			},
			setter: function(json) {
				this.actualclosebutton = specialbutton(json, 'ts-icon-close');
			}
		},

		/**
		 * Reserved for the burger button that opens main navigation in mobile.
		 * @type {ts.ui.ButtonModel}
		 */
		burgerbutton: {
			getter: function() {
				return this.actualburgerbutton;
			},
			setter: function(json) {
				this.actualburgerbutton = specialbutton(json, 'ts-icon-menuswitch');
			}
		},

		/**
		 * Dedicated Back button.
		 * @type {ts.ui.ButtonModel}
		 */
		backbutton: {
			getter: function() {
				return this.actualbackbutton;
			},
			setter: function(json) {
				this.actualbackbutton = specialbutton(json, 'ts-icon-arrowleft');
			}
		},

		/**
		 * Dedicated Forward button.
		 * @type {ts.ui.ButtonModel}
		 */
		forwardbutton: {
			getter: function() {
				return this.actualforwardbutton;
			},
			setter: function(json) {
				this.actualforwardbutton = specialbutton(json, 'ts-icon-arrowright');
			}
		},

		/**
		 * Checkbox (mainly to handle the actionbar selections).
		 * @type {ts.ui.CheckBoxModel}
		 */
		checkbox: {
			getter: function() {
				return this.actualcheckbox;
			},
			setter: function(json) {
				this.actualcheckbox = json ? CheckBoxModel.from(json) : null;
			}
		},

		/**
		 * (woraround bug in EDBML spec)
		 * @type {ts.ui.ButtonModel}
		 */
		actualconfigbutton: null,

		/**
		 * (woraround bug in EDBML spec)
		 * @type {ts.ui.ButtonModel}
		 */
		actualhelpbutton: null,

		/**
		 * (woraround bug in EDBML spec)
		 * @type {ts.ui.ButtonModel}
		 */
		actualclosebutton: null,

		/**
		 * (woraround bug in EDBML spec)
		 * @type {ts.ui.ButtonModel}
		 */
		actualburgerbutton: null,

		/**
		 * (woraround bug in EDBML spec)
		 * @type {ts.ui.ButtonModel}
		 */
		actualbackbutton: null,

		/**
		 * (woraround bug in EDBML spec)
		 * @type {ts.ui.ButtonModel}
		 */
		actualforwardbutton: null,

		/**
		 * (woraround bug in EDBML spec, quite embaressing by now)
		 * @type {ts.ui.CheckBoxModel}
		 */
		actualcheckbox: null,

		/**
		 * Newup defaults.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.buttons = this.buttons || [];
			this.actions = this.actions || [];
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
		 */
		onchange: function(changes) {
			var has = 'hascontent';
			var had = 'hadcontent';
			if (!this.hadcontent) {
				this.hadcontent = changes.some(function(c) {
					return c.name === has && c.newValue;
				});
			}
			if (
				changes.some(function(c) {
					return c.name !== has && c.name !== had;
				}, this)
			) {
				this._updatehascontent();
			}
		},

		/**
		 * Clear the stuff.
		 * @returns {ts.ui.ToolBarModel}
		 */
		clear: chained(function() {
			this.tabs.clear();
			this.buttons.clear();
			this.search = null;
			this.title = null;
			this._updatehascontent();
		}),

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
		 * @param {boolean} doit
		 */
		_watchmodels: function(doit) {
			[this, this.buttons, this.tabs].forEach(function(model) {
				if (doit) {
					model.addObserver(this);
				} else {
					model.removeObserver(this);
				}
			}, this);
		},

		/**
		 * Compute the property `hascontent` so that others
		 * won't have to remember this long list of checks.
		 * TODO: We will really have to get rid of this !!!
		 * @returns {boolean} True when there's content...
		 */
		_updatehascontent: function() {
			this.hascontent = !!(
				this.tabs.length ||
				this.buttons.length ||
				this.title ||
				this.status ||
				this.search ||
				this.closebutton
			);
			return this.hascontent;
		}
	});
})(gui.Combo.chained, ts.ui.ButtonModel, ts.ui.CheckBoxModel);
