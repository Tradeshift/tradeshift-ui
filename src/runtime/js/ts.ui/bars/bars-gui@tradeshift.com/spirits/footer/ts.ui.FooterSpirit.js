/**
 * Spirit of the (main) footer, a container for up to three toolbars.
 * TODO: Implement `onpage` callback for parity with Table.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 * @using {gui.Array} GuiArray
 */
ts.ui.FooterSpirit = (function using(chained, GuiArray) {
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
		onconfigure: function() {
			this.super.onconfigure();
			this._buffer = new ts.ui.ButtonCollection();
			this._buffer.addObserver(this);
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
			if (this._hasPager() && this._hasButtons()) {
				var was = this._conflict;
				var now = this._hittest();
				if (was !== now) {
					this._transfer();
				}
			}
		},

		/**
		 * Handle changes in observed button collection.
		 * @param {Array<edb.Change>} changes
		 */
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

		/**
		 * The buttons may be moved around in three different bars, so we will just 
		 * use a {ts.ui.ButtonCollection} that isn't attached to anyone in particular.
		 * @param {ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(buttons) {
			var buffer = this._buffer;
			if (arguments.length) {
				buffer.clear();
				buttons.forEach(function(json) {
					buffer.push(json);
				});
				if (this._hasPager()) {
					this._measure();
				} else {
					this._transfer();
				}
			} else {
				return buffer;
			}
		}),

		/**
		 * Pager (in the centerbar) and buttons (in the bufferbar) would overlap?
		 * @returns {boolean}
		 */
		_hittest: function() {
			var pager = this._centerbar.spirit.dom.q('.ts-toolbar-pager');
			var butts = this._bufferbar.spirit.dom.q('.ts-toolbar-menu.ts-right');
			if (pager && butts) {
				return (this._conflict = box(pager).right > box(butts).left);
			}
			return false;
		},

		/**
		 * @param {ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		actions: chained(function(actions) {
			var bar = this._actionbar();
			if (arguments.length) {
				bar.actions(actions);
			} else {
				return bar.actions();
			}
		}),

		/**
		 * Get or set the pager. Pass `null` to remove the pager (via bad API :/)
		 * @param @optional {object|ts.ui.PagerModel|null} [json]
		 * @returns {ts.ui.PagerModel|ts.ui.ToolBarSpirit}
		 */
		pager: chained(function(json) {
			var bar = this._centerbar();
			if (arguments.length) {
				bar.pager(json);
				if (this._hasButtons() || json === null) {
					this._pagerchanged = true;
					if (json === null) {
						this._conflict = false;
					}
				}
			} else {
				return bar.pager();
			}
		}),

		/**
		 * @param {Object|null} [json]
		 * @returns {this|ts.ui.Model}
		 */
		checkbox: chained(function(json) {
			var bar = this._actionbar();
			if (arguments.length) {
				bar.checkbox(json);
			} else {
				return bar.checkbox();
			}
		}),

		/**
		 * Remove that checkbox.
		 */
		nocheckbox: chained(function() {
			this._oncheckboxclick = null;
			this._actionbar().checkbox(null);
		}),

		/**
		 * @param {string} [message]
		 * @returns {this|string}
		 */
		status: chained(function(message) {
			var bar = this._actionbar();
			if (arguments.length) {
				bar.message(message);
			} else {
				return bar.message();
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
		 * Elaborate setup to ensure that we never hide or show the toolbars 
		 * until they have been rendered (so that they doen't flicker badly).
		 * @param {gui.Life} l
		 */
		onlife: function xxx(l) {
			this.super.onlife(l);
			var bufferbar = this._bufferbar.spirit;
			var backupbar = this._backupbar.spirit;
			var centerbar = this._centerbar.spirit;
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
			this._hidebar(this._actionbar());
		}),

		/**
		 * Show the actions bar.
		 * @returns {this}
		 */
		showActions: chained(function() {
			this._showbar(this._actionbar());
		}),

		/**
		 * Hide the pager bar (TODO: RENAME! DEPRECATE?)
		 * @returns {this}
		 */
		hidePager: chained(function() {
			this._hidebar(this._centerbar());
		}),

		/**
		 * Hide the pager bar (TODO: RENAME! DEPRECATE?)
		 * @returns {this}
		 */
		showPager: chained(function() {
			this._hidebar(this._centerpager());
		}),

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
		 * Get the backupbar, at the very bottom (create it if needed).
		 * The backupbar remains hidden until rendered (with content).
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		_backupbar: function backupbar() {
			if (!backupbar.spirit) {
				backupbar.spirit = this.dom.append(ts.ui.StatusBarSpirit.summon());
				backupbar.spirit.life.add(gui.LIFE_RENDER, this);
				backupbar.spirit.hide();
			}
			return backupbar.spirit;
		},

		/** 
		 * Get the actionbar (create it if needed).
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		_actionbar: function actionbar() {
			if (!actionbar.spirit) {
				actionbar.spirit = this.dom.prepend(ts.ui.StatusBarSpirit.summon());
				actionbar.spirit.micro();
				this.css.add('has-actionbar');
				this._globallayout();
			}
			return actionbar.spirit;
		},

		/**
		 * Get the centerbar (create it if needed).
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_centerbar: function centerbar() {
			if (!centerbar.spirit) {
				var spirit = ts.ui.StatusBarSpirit.summon();
				spirit.life.add(gui.LIFE_RENDER, this);
				var target = null;
				if ((target = this._backupbar.spirit)) {
					spirit.dom.insertBefore(target);
				} else if ((target = this._actionbar.spirit)) {
					spirit.dom.insertAfter(target);
				} else {
					this.dom.append(spirit);
				}
				this.css.add('has-centerbar');
				centerbar.spirit = spirit;
				this._globallayout();
			}
			return centerbar.spirit;
		},

		/**
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_bufferbar: function bufferbar() {
			if (!bufferbar.spirit) {
				bufferbar.spirit = this.dom.after(ts.ui.ToolBarSpirit.summon());
				bufferbar.spirit.life.add(gui.LIFE_RENDER, this);
				bufferbar.spirit.css.add('ts-mainfooter-buffer');
			}
			return bufferbar.spirit;
		},

		/**
		 * Set classnames on `html` to control the `bottom` position of Main.
		 * TODO: Once we have the TopBar converted to a Header, we should 
		 * probably go all the way and create a "LayoutEngine" of sorts that 
		 * can be poked programatically instead of dispatching these actions.
		 * @param {number} [level]
		 */
		_globallayout: function(level) {
			var offset = 0;
			var footer = this._backupbar.spirit;
			var action = this._actionbar.spirit;
			var pagerb = this._centerbar.spirit;
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
		 * @see {ts.ui.FooterSpirit#onlife}
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
		 * Footer has pager?
		 * @returns {boolean}
		 */
		_hasPager: function() {
			return !!(this._centerbar.spirit && this._centerbar().pager());
		},

		/**
		 * Footer has buttons?
		 * @returns {boolean}
		 */
		_hasButtons: function() {
			return !!(this._bufferbar.spirit && this._bufferbar().buttons().length);
		}
	});
})(gui.Combo.chained, gui.Array);
