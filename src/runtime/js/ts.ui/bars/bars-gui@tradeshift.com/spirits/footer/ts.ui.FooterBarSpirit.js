/**
 * Spirit of the (main) footer, a container for up to three toolbars.
 * TODO: Implement `onpage` callback for parity with Table.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 * @using {gui.Array} GuiArray
 * @using {ts.ui.PagerModel} PagerModel
 * @using {Class<ts.ui.ToolBarSpirit>} ToolBarSpirit
 */
ts.ui.FooterBarSpirit = (function using(chained, GuiArray, PagerModel, ToolBarSpirit) {
	/**
	 * Get bounding box.
	 * @param {Element} elm
	 * @returns {object}
	 */
	function box(elm) {
		return elm.getBoundingClientRect();
	}

	return ts.ui.Spirit.extend({
		/**
		 * Get or set visibility.
		 * @type {boolean}
		 */
		visible: {
			getter: function() {
				return this._visible;
			},
			setter: function(is) {
				if (is !== this._visible) {
					if ((this._visible = is)) {
						this.dom.show();
					} else {
						this.dom.hide();
					}
					this._layout();
				}
			}
		},

		/**
		 * Initialize the whole shebang.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.script.load(ts.ui.FooterBarSpirit.edbml);
			this.script.input((this._model = new ts.ui.FooterModel()));
		},

		/**
		 * Add local and global classname.
		 */
		onenter: function() {
			this.super.onenter();
			this.css.add('ts-mainfooter ts-bg-lite');
			this.guilayout.shiftGlobal(true, 'ts-has-footer');
		},

		/**
		 * Evaluate conflict between pager and buttons in light of new window size.
		 */
		onflex: function() {
			this.super.onflex();
			/*
			if (this._hasPager() && this._hasButtons()) {
				var was = this._conflict;
				var now = this._hittest();
				if (was !== now) {
					this._transfer();
				}
			}
			*/
		},

		/**
		 * @param {Array<object>|ts.ui.ButtonCollection} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(json) {
			var bufferbar = this._model.bufferbar;
			if (arguments.length) {
				bufferbar.buttons = json;
			} else {
				return bufferbar.buttons;
			}
		}),

		/**
		 * @param {Array<Object>|ts.ui.ActionsCollection} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		actions: chained(function(json) {
			var actionbar = this._model.actionbar;
			if (arguments.length) {
				actionbar.actions = json;
			} else {
				return actionbar.actions;
			}
		}),

		/**
		 * Get or set the pager. Pass `null` to remove the pager.
		 * @param @optional {Object|ts.ui.PagerModel|null} [json]
		 * @returns {ts.ui.PagerModel|ts.ui.ToolBarSpirit}
		 */
		pager: chained(function(json) {
			var centerbar = this._model.centerbar;
			if (arguments.length) {
				centerbar.pager = json ? PagerModel.from(json) : null;
				this._pagerchanged = true;
			} else {
				return centerbar.pager;
			}
		}),

		/**
		 * @param {Object|null} [json]
		 * @returns {this|ts.ui.Model}
		 */
		checkbox: chained(function(json) {
			var actionbar = this._model.actionbar;
			if (arguments.length) {
				actionbar.checkbox = json;
			} else {
				return actionbar.checkbox;
			}
		}),

		/**
		 * @param {string} [message]
		 * @returns {this|string}
		 */
		status: chained(function(message) {
			var actionbar = this._model.actionbar;
			if (arguments.length) {
				actionbar.title = message;
			} else {
				return actionbar.title;
			}
		}),

		/**
		 * TODO: At some point, consider introducing all these toolbars lazily.
		 * @param {Object} summary
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
			if (summary.first) {
				[
					(this._actionbar = this._getbar('.ts-footerbar-actionbar')),
					(this._centerbar = this._getbar('.ts-footerbar-centerbar')),
					(this._backupbar = this._getbar('.ts-footerbar-backupbar')),
					(this._bufferbar = this._getbar('.ts-footerbar-bufferbar'))
				].forEach(function(spirit) {
					spirit.life.add(gui.LIFE_RENDER, this);
				}, this);
			}
		},

		/**
		 * Handle life.
		 * @param {gui.Life} l
		 */
		onlife: function xxx(l) {
			this.super.onlife(l);
			if (l.type === gui.LIFE_RENDER) {
				switch (l.target) {
					case this._bufferbar:
						this._optimize();
						break;
					case this._centerbar:
						if (this._pagerchanged) {
							this._pagerchanged = false;
							this._optimize();
						}
						break;
				}
				this._layout();
			}
		},

		/**
		 * Hide the whole footer.
		 * @returns {this}
		 */
		hide: chained(function() {
			if (this.visible) {
				this.visible = false;
			}
		}),

		/**
		 * Show the whole footer.
		 * @returns {this}
		 */
		show: chained(function() {
			if (!this.visible) {
				this.visible = true;
			}
		}),

		/**
		 * Hide the actions bar.
		 * @returns {this}
		 */
		hideActions: chained(function() {
			// this._hidebar(this._actionbar());
		}),

		/**
		 * Show the actions bar.
		 * @returns {this}
		 */
		showActions: chained(function() {
			// this._showbar(this._actionbar());
		}),

		/**
		 * Hide the pager bar (TODO: RENAME! DEPRECATE?)
		 * @returns {this}
		 */
		hidePager: chained(function() {
			// this._hidebar(this._centerbar());
		}),

		/**
		 * Hide the pager bar (TODO: RENAME! DEPRECATE?)
		 * @returns {this}
		 */
		showPager: chained(function() {
			// this._hidebar(this._centerpager());
		}),

		// Privileged ..............................................................

		/**
		 * Should show the action bar?
		 * This is called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showActionBar: function(model) {
			return !!(model.actions.getLength() || model.title || model.checkbox);
		},

		/**
		 * Should show the center bar?
		 * This is called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showCenterBar: function(model) {
			return !!(model.pager || model.buttons.getLength());
		},

		/**
		 * Should show the backup bar?
		 * This is called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showBackupBar: function(model) {
			return !!model.buttons.getLength();
		},

		// Private .................................................................

		/**
		 * Visible? Please only update this via the `visible` property (no underscore).
		 * @type {boolean}
		 */
		_visible: true,

		/**
		 * Since the buttons will be moved around, it's easier if we collect them 
		 * in an "off-screen" buffer so that they don't belong anywhere in the UI.
		 * @type {ts.ui.ButtonCollection}
		 */
		_buffer: null,

		/**
		 * There's a conflict in size between pager and buttons (while resizing)?
		 * @type {boolean}
		 */
		_conflict: false,

		/**
		 * @type {Function}
		 */
		_oncheckboxclick: null,

		/**
		 * Just a flag to indicate that the pager appeared or disappeared.
		 * @type {boolean}
		 */
		_pagerchanged: false,

		/**
		 * Spirit of the buffer bar.
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_bufferbarspirit: null,

		/**
		 * Spirit of the backup bar.
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_backupbarspirit: null,

		/**
		 * Spirit of the action bar.
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_actionbarspirit: null,

		/**
		 * Spirit of the center bar.
		 * @type {ts.ui.StatusBarSpirit}
		 */
		_centerbarspirit: null,

		/**
		 * Lookup ToolBarSpirit by selector.
		 * @param {string} selector
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_getbar: function(selector) {
			return this.dom.q(selector, ToolBarSpirit);
		},

		/**
		 * Attempt to optimize the vertical height by stacking the bars only when needed.
		 */
		_optimize: function() {
			var model = this._model;
			if (model.bufferbar.buttons.length) {
				var clone = gui.Array.from(model.bufferbar.buttons);
				if (this._hittest()) {
					model.backupbar.buttons = clone;
					model.centerbar.buttons.clear();
				} else {
					model.centerbar.buttons = clone;
					model.backupbar.buttons.clear();
				}
			}
		},

		/**
		 * Pager (in the centerbar) and buttons (in the bufferbar) would overlap?
		 * @returns {boolean}
		 */
		_hittest: function() {
			var pager = this._centerbar.dom.q('.ts-toolbar-pager');
			var butts = this._bufferbar.dom.q('.ts-toolbar-menu.ts-right');
			if (pager && butts) {
				return (this._conflict = box(pager).right > box(butts).left);
			}
			return false;
		},

		/**
		 * Dispatch some action bearing offset info for the general environment to handle.
		 * If no bars are visible, we'll hide ourselves not to show an awkward dropshadow.
		 */
		_layout: function() {
			var offset = this._offset([this._actionbar, this._centerbar, this._backupbar]);
			this.action.dispatch(ts.ui.ACTION_FOOTER_LEVEL, offset);
			this.visible = !!offset;
		},

		/**
		 * Compute the total height of bars measured in units (currently at `22px`).
		 * @param {Array<ts.ui.ToolBarSpirit>} bars
		 * @returns {number};
		 */
		_offset: function(bars) {
			return bars.reduce(function sum(offset, bar, index) {
				return offset + (bar.visible ? (index ? 3 : 2) : 0);
			}, 0);
		}
	});
})(gui.Combo.chained, gui.Array, ts.ui.PagerModel, ts.ui.ToolBarSpirit);
