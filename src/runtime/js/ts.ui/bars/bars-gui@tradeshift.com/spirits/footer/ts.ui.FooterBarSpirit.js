/**
 * Spirit of the (main) footer, a container for up to three toolbars.
 * TODO: Implement `onpage` callback for parity with Table.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 * @using {gui.Array} GuiArray
 * @using {ts.ui.PagerModel} PagerModel
 */
ts.ui.FooterBarSpirit = (function using(chained, GuiArray, PagerModel) {
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
		 * Footer is visible? Note that even so, it won't show up until populated.
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * Initialize shebang.
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
		 * Handle changes in observed button collection.
		 * @param {Array<edb.Change>} changes
		 *
		onchange: function(changes) {
			this.super.onchange(changes);
			var buffer = this._buffer;
			if (
				changes.some(function isbuttons(c) {
					return c.object === buffer;
				})
			) {
				this._measure();
				if (!buffer.length) {
					this._conflict = false;
				}
			}
		},
		*/

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
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			switch (a.type) {
				case ts.ui.ACTION_STATUSBAR_LEVEL:
					this._globallayout(a.data);
					a.consume();
					break;
			}
		},

		/**
		 * @param {Object} summary
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
			if (summary.first) {
				[
					(this._actionbar = this.dom.q('.ts-footerbar-actionbar', ts.ui.Spirit)),
					(this._centerbar = this.dom.q('.ts-footerbar-centerbar', ts.ui.Spirit)),
					(this._backupbar = this.dom.q('.ts-footerbar-backupbar', ts.ui.Spirit)),
					(this._bufferbar = this.dom.q('.ts-footerbar-bufferbar', ts.ui.Spirit))
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
						this._heilhitler();
						break;
					case this._centerbar:
						if (this._pagerchanged) {
							this._pagerchanged = false;
							this._heilhitler();
						}
						break;
				}
			}

			/*
			var bufferbar = this._bufferbarspirit;
			var backupbar = this._backupbarspirit;
			var centerbar = this._centerbarspirit;
			if (l.type === gui.LIFE_RENDER) {
				switch (l.target) {
					case bufferbar:
						this._transfer();
						break;
					case backupbar:
						if (backupbar.buttons().length) {
							this._showbar(backupbar);
						} else {
							this._hidebar(backupbar);
						}
						break;
					case centerbar:
						if (this._pagerchanged) {
							this._pagerchanged = false;
							if (this._hasPager()) {
								this._transfer();
							}
						}
						break;
				}
			}
			*/
		},

		_heilhitler: function() {
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
		 * Hide the whole footer.
		 * @returns {this}
		 */
		hide: chained(function() {
			if (this.visible) {
				this.visible = false;
				this.dom.hide();
				this._globallayout();
			}
		}),

		/**
		 * Show that footer.
		 * @returns {this}
		 */
		show: chained(function() {
			if (!this.visible) {
				this.visible = true;
				this.dom.show();
				this._globallayout();
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
		 * Called from EDBML.
		 * @returns {boolean}
		 */
		$showActionBar: function(model) {
			return !!(model.actions.getLength() || model.title || model.checkbox);
		},

		/**
		 * Called from EDBML.
		 * @returns {boolean}
		 */
		$showCenterBar: function(model) {
			return !!(model.pager || model.buttons.getLength());
		},

		/**
		 * Called from EDBML.
		 * @returns {boolean}
		 */
		$showBackupBar: function(model) {
			return !!model.buttons.getLength();
		},

		// Private .................................................................

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
		 * Get the backupbar, at the very bottom (create it if needed).
		 * The backupbar remains hidden until rendered (with content).
		 * @returns {ts.ui.StatusBarSpirit}
		 *
		_backupbar: function backupbar() {
			if (!this._backupbarspirit) {
				this._backupbarspirit = this.dom.append(ts.ui.StatusBarSpirit.summon());
				this._backupbarspirit.life.add(gui.LIFE_RENDER, this);
				this._backupbarspirit.hide();
			}
			return this._backupbarspirit;
		},

		/** 
		 * Get the actionbar (create it if needed).
		 * @returns {ts.ui.StatusBarSpirit}
		 *
		_actionbar: function actionbar() {
			if (!this._actionbarspirit) {
				this._actionbarspirit = this.dom.prepend(ts.ui.StatusBarSpirit.summon());
				this._actionbarspirit.micro();
				this._actionbarspirit.css.add('has-actionbar'); // NEEDED ?
				this._globallayout();
			}
			return this._actionbarspirit;
		},

		/**
		 * Get the centerbar (create it if needed).
		 * @returns {ts.ui.ToolBarSpirit}
		 *
		_centerbar: function centerbar() {
			if (!this._centerbarspirit) {
				var spirit = ts.ui.StatusBarSpirit.summon();
				spirit.life.add(gui.LIFE_RENDER, this);
				var target = null;
				if ((target = this._backupbarspirit)) {
					spirit.dom.insertBefore(target);
				} else if ((target = this._actionbarspirit)) {
					spirit.dom.insertAfter(target);
				} else {
					this.dom.append(spirit);
				}
				this.css.add('has-centerbar');
				this._centerbarspirit = spirit;
				this._globallayout();
			}
			return this._centerbarspirit;
		},

		/**
		 * @returns {ts.ui.ToolBarSpirit}
		 *
		_bufferbar: function() {
			if (!this._bufferbarspirit) {
				this._bufferbarspirit = this.dom.after(ts.ui.ToolBarSpirit.summon());
				this._bufferbarspirit.life.add(gui.LIFE_RENDER, this);
				this._bufferbarspirit.css.add('ts-mainfooter-buffer');
			}
			return this._bufferbarspirit;
		},
		*/

		/**
		 * Set classnames on `html` to control the `bottom` position of Main.
		 * TODO: Once we have the TopBar converted to a Header, we should 
		 * probably go all the way and create a "LayoutEngine" of sorts that 
		 * can be poked programatically instead of dispatching these actions.
		 * @param {number} [level]
		 */
		_globallayout: function(level) {
			var offset = 0;
			var footer = this._backupbarspirit;
			var action = this._actionbarspirit;
			var pagerb = this._centerbarspirit;
			if (this.visible) {
				if (action && action.visible) {
					offset += 2;
				}
				if (pagerb && pagerb.visible) {
					offset += 3;
				}
				if (footer && footer.visible) {
					offset += level || 3;
				}
				this._locallayout(footer, action, pagerb);
			}
			this.action.dispatch(ts.ui.ACTION_FOOTER_LEVEL, offset);
		},

		/**
		 * If all the bars are hidden, we might as well hide ourselves 
		 * so that we don't render some kind of weird looking shadow.
		 * @param {ts.ui.StatusBarSpirit} footer
		 * @param {ts.ui.StatusBarSpirit} action
		 * @param {ts.ui.ToolBarSpirit} pagerb
		 */
		_locallayout: function(footer, action, pagerb) {
			if (
				[footer, action, pagerb].reduce(function(is, bar) {
					return is || (bar && bar.visible);
				}, false)
			) {
				this.dom.show();
			} else {
				this.dom.hide();
			}
		},

		/**
		 * Send the buttons to some offscreen toolbar 
		 * so that we can measure them when rendered.
		 * @see {ts.ui.FooterBarSpirit#onlife}
		 */
		_measure: function() {
			this._bufferbar().buttons(JSON.parse(JSON.stringify(this._buffer)));
		},

		/**
		 * If buttons overlap the pager, transfer them to the backup bar.
		 * Otherwise, we will transfer them straight to the central bar.
		 */
		_transfer: function johnson() {
			var list = GuiArray.from(this._buffer);
			if (this._hasPager()) {
				this._migrate(list, this._centerbar(), this._backupbar(), this._hittest());
			} else {
				this._centerbar().buttons(list);
			}
		},

		/**
		 * Move list of buttons from one bar to the other depending on the hittest.
		 * @param {Array.ts.ui.ButtonSpirit}
		 * @param {ts.ui.ToolBarSpirit} bar1
		 * @param {ts.ui.ToolBarSpirit} bar2
		 * @param {boolean} hits
		 */
		_migrate: function(list, bar1, bar2, hits) {
			(hits ? bar1 : bar2).buttons().clear();
			(hits ? bar2 : bar1).buttons(list);
		},

		/**
		 * Show that bar.
		 * @param {ts.ui.ToolBarSpirit} bar
		 */
		_showbar: function(bar) {
			if (!bar.visible) {
				bar.show();
				this._globallayout();
			}
		},

		/**
		 * Hide the bar.
		 * @param {ts.ui.ToolBarSpirit} bar
		 */
		_hidebar: function(bar) {
			if (bar.visible) {
				bar.hide();
				this._globallayout();
			}
		},

		/**
		 * Has pager?
		 * @returns {boolean}
		 */
		_hasPager: function() {
			var bar = this._centerbarspirit;
			return !!(bar && bar.pager());
		},

		/**
		 * Has buttons?
		 * @returns {boolean}
		 */
		_hasButtons: function() {
			var bar = this._bufferbarspirit;
			return !!(bar && bar.buttons().length);
		}
	});
})(gui.Combo.chained, gui.Array, ts.ui.PagerModel);
