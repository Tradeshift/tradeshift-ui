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

		/*
		 * Get (or set) the model. This will load the EDBML.
		 * @param {object|ts.ui.ToolBarModel} model
		 * @returns {ts.ui.ToolBarModel|ts.ui.ToolBarSpirit}
		 */
		model: ts.ui.Spirit.createModelMethod(ts.ui.FooterBarModel, 'ts.ui.FooterBarSpirit.edbml'),

		/**
		 * Add local and global classname.
		 * TODO: Do this stunt elsewhere?
		 */
		onenter: function() {
			this.super.onenter();
			if (this.guilayout.outsideMain()) {
				this.css.add('ts-mainfooter ts-bg-lite');
				this.guilayout.shiftGlobal(true, 'ts-has-footer');
			}
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
		 * Get or set the buttons.
		 * [The buttons will be rendered in the `bufferbar`!]
		 * @param {Array<object>|ts.ui.ButtonCollection} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				model.buttons = json;
			} else {
				return model.buttons;
			}
		}),

		/**
		 * Get or set the actions.
		 * [The actions will be rendered in the `actionbar`!]
		 * @param {Array<Object>|ts.ui.ActionsCollection} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		actions: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				model.actions = json;
			} else {
				return model.actions;
			}
		}),

		/**
		 * Get or set the pager. Pass `null` to remove the pager.
		 * [The pager will be rendered in the `centerbar`!]
		 * @param @optional {Object|ts.ui.PagerModel|null} [json]
		 * @returns {ts.ui.PagerModel|ts.ui.ToolBarSpirit}
		 */
		pager: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				model.pager = json;
				this._pagerchanged = true;
			} else {
				return model.pager;
			}
		}),

		/**
		 * [The checkbox will be rendered in the `centerbar`!]
		 * @param {Object|null} [json]
		 * @returns {this|ts.ui.Model}
		 */
		checkbox: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				model.checkbox = json;
			} else {
				return model.checkbox;
			}
		}),

		/**
		 * [The status will be rendered in the `actionbar`!]
		 * @param {string} [message] 
		 * @returns {this|string}
		 */
		status: chained(function(message) {
			var model = this.model();
			if (arguments.length) {
				model.status = message;
			} else {
				return model.status;
			}
		}),

		/**
		 * Show the dedicated config button.
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		showConfig: chained(function(onclick) {
			this.model().configbutton = {
				onclick: onclick
			};
		}),

		/**
		 * Hide the configbutton.
		 * @returns {this}
		 */
		hideConfig: chained(function() {
			this.model().configbutton = null;
		}),

		/**
		 * Show the dedicated collaboration button.
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		showCollaboration: chained(function(onclick) {
			this.model().collabbutton = {
				label: 'Collaborate On This',
				icon: 'ts-icon-collaboration',
				onclick: onclick
			};
		}),

		/**
		 * Show the dedicated collaboration button.
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		hideCollaboration: chained(function(onclick) {
			this.model().collabbutton = null;
		}),

		/**
		 * Index the various bars and watch for rendering updates.
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
				this._layout();
			}
			this._refresh();
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
			var clone = null;
			var model = this.model();
			var buttons = model.bufferbar.buttons;
			var actions = model.bufferbar.actions;
			if (buttons) {
				clone = gui.Array.from(buttons);
				if (this._hittest()) {
					model.backupbar.buttons = clone;
					model.centerbar.buttons.clear();
				} else {
					model.centerbar.buttons = clone;
					model.backupbar.buttons.clear();
				}
			}
			if (actions) {
				clone = gui.Array.from(actions);
				model.centerbar.actions.clear();
				model.centerbar.actions = clone;
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
		},

		/**
		 * There's just no way that this can work with pure CSS, so here it is: 
		 * Style the thing so that there is a 1px border separator between bars.
		 */
		_refresh: function() {
			[this._centerbar, this._backupbar].reduce(function(was, bar) {
				var is = bar.visible;
				bar.css.shift(is && was, 'ts-toolbar-divider');
				return was || is;
			}, this._actionbar.visible);
		}
	});
})(gui.Combo.chained, gui.Array, ts.ui.PagerModel, ts.ui.ToolBarSpirit);
