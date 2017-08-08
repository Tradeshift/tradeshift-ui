/**
 * Spirit of the (main) footer, a container for up to three toolbars.
 * TODO: Implement `onpage` callback for parity with Table.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Array} GuiArray
 * @using {ts.ui.PagerModel} PagerModel
 * @using {Class<ts.ui.ToolBarSpirit>} ToolBarSpirit
 */
ts.ui.FooterBarSpirit = (function using(
	chained,
	confirmed,
	GuiArray,
	PagerModel,
	ToolBarSpirit,
	Type
) {
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
		 * Open for implementation: Callback for when a link is clicked in status message.
		 * @type {Function}
		 */
		onlink: null,

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
			this._optimize(true);
		},

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			if (a.type === ts.ui.ACTION_SAFE_LINK) {
				(this.onlink || function() {}).call(this, a.data);
				a.consume();
			}
		},

		/**
		 * Get or set the buttons.
		 * [The buttons will be rendered in the `bufferbar`!]
		 * @param {Array<object>|ts.ui.ButtonCollection|null} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				if (json === null) {
					model.buttons.clear();
				} else {
					model.buttons = json;
				}
			} else {
				return model.buttons;
			}
		}),

		/**
		 * Get or set the actions.
		 * [The actions will be rendered in the `actionbar`!]
		 * @param {Array<Object>|ts.ui.ActionsCollection|null} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		actions: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				if (json === null) {
					model.actions.clear();
				} else {
					model.actions = json;
				}
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
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		configbutton: chained(function(onclick) {
			return this.model().configbutton.apply(this.model(), arguments);
		}),

		/**
		 * Show collaboration button.
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		collabbutton: chained(function(onclick) {
			return this.model().collabbutton.apply(this.model(), arguments);
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
		 * Hide the whole footer and *stay hidden* until `show` is called.
		 * @returns {this}
		 */
		hide: chained(function() {
			if (this.visible) {
				this._hidden = true;
				this.visible = false;
			}
		}),

		/**
		 * Show the footer (when hidden, will otherwise appear when populated).
		 * @returns {this}
		 */
		show: chained(function() {
			if (!this.visible) {
				this._hidden = false;
				this.visible = true;
			}
		}),

		/**
		 * Clear everything (this will automatically hide the FooterBar).
		 * @returns {this}
		 */
		clear: chained(function() {
			this.model().clear();
		}),

		/**
		 * Manually enable support for links in the status message (just to
		 * remind yourself that you may now be enncouraging phishing attacks).
		 * @param @optional {function} onlink
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		linkable: confirmed('(function)')(
			chained(function(onlink) {
				this.model().linkable(true);
				this.action.add(ts.ui.ACTION_SAFE_LINK);
				this.onlink = onlink || null;
			})
		),

		/**
		 *
		 */
		unlinkable: chained(function() {
			this.model().linkable(false);
			this.remove.add(ts.ui.ACTION_SAFE_LINK);
			this.onlink = null;
		}),

		// Private .................................................................

		/**
		 * Visible? Please only update this via the `visible` property (no underscore).
		 * @type {boolean}
		 */
		_visible: true,

		/**
		 *
		 */
		_hidden: false,

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
		 * Spirit of the buffer bar (remains invisible at all times).
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_bufferbar: null,

		/**
		 * Spirit of the action bar.
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_actionbar: null,

		/**
		 * Spirit of the center bar (usually the bottom bar unless collissions).
		 * @type {ts.ui.StatusBarSpirit}
		 */
		_centerbar: null,

		/**
		 * Spirit of the backup bar (only visible upon collistions in centerbar).
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_backupbar: null,

		/**
		 * Lookup ToolBarSpirit by selector.
		 * @param {string} selector
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_getbar: function(selector) {
			return this.dom.q(selector, ToolBarSpirit);
		},

		/**
		 * Attempt to optimize the vertical height by stacking the bars when needed.
		 * @param {boolean} [flexing]
		 */
		_optimize: function(flexing) {
			var model = this.model();
			var buttons = model.bufferbar.buttons;
			var actions = model.bufferbar.actions;
			if (!flexing || buttons.length) {
				var hits = this._hittest();
				this._optimizebuttons(model, gui.Array.from(buttons), hits);
				this._optimizeactions(model, gui.Array.from(actions), hits);
			}
		},

		/**
		 * Teleport buttons between centerbar and backupbar.
		 * @param {ts.ui.FooterBarModel} model
		 * @param {Array<ts.ui.ButtonModel>} clone
		 * @param {boolean} hits
		 */
		_optimizebuttons: function(model, clone, hits) {
			if (hits) {
				model.backupbar.buttons = clone;
				model.centerbar.buttons.clear();
			} else {
				model.centerbar.buttons = clone;
				model.backupbar.buttons.clear();
			}
		},

		/**
		 * Teleport actions (collaborationbutton!) between centerbar and backupbar.
		 * @param {ts.ui.FooterBarModel} model
		 * @param {Array<ts.ui.ButtonModel>} clone
		 * @param {boolean} hits
		 */
		_optimizeactions: function(model, clone, hits) {
			if (hits) {
				model.centerbar.actions.clear();
				model.backupbar.actions = clone;
			} else {
				model.backupbar.actions.clear();
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
			if (this._hidden) {
				this.action.dispatch(ts.ui.ACTION_FOOTER_LEVEL, 0);
			} else {
				var offset = this._offset([this._actionbar, this._centerbar, this._backupbar]);
				this.action.dispatch(ts.ui.ACTION_FOOTER_LEVEL, offset);
				this.visible = !!offset;
			}
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
})(
	gui.Combo.chained,
	gui.Arguments.confirmed,
	gui.Array,
	ts.ui.PagerModel,
	ts.ui.ToolBarSpirit,
	gui.Type
);
