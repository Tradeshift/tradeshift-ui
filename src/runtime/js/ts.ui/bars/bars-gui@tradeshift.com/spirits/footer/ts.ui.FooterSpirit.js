/**
 * Spirit of the (main) footer, a container for up to three toolbars.
 * TODO: Implement `onpage` callback for parity with Table.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 * @using {gui.Array} GuiArray
 */
ts.ui.FooterSpirit = (function using(chained, GuiArray) {
	/**
	 * @type {boolean}
	 */
	var conflict = false;

	/**
	 * @param {ts.ui.ToolBarSpirit} bar1
	 * @param {ts.ui.ToolBarSpirit} bar2
	 * @returns {boolean}
	 */
	function hittest(bar1, bar2) {
		var pager = bar1.dom.q('.ts-toolbar-pager');
		var butts = bar2.dom.q('.ts-toolbar-menu.ts-right');
		if (pager && butts) {
			return box(pager).right > box(butts).left;
		}
		return false;
	}

	/**
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
		 * Add local and global classname.
		 */
		onenter: function() {
			this.super.onenter();
			this.css.add('ts-mainfooter ts-bg-lite');
			this.guilayout.shiftGlobal(true, 'ts-has-footer');
		},

		/**
		 * @param {ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(buttons) {
			var bar = conflict ? this._buttonbar() : this._pagerbar();
			if (arguments.length) {
				bar.buttons(buttons);
				bar.dom.show();
			} else {
				return bar.buttons();
			}
		}),

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
			var bar = this._pagerbar();
			if (arguments.length) {
				bar.pager(json);
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
		 * Handle life (when PagerBar rendered).
		 * @param {gui.Life} l
		 */
		onlife: function(l) {
			this.super.onlife(l);
			switch (l.target) {
				case this._pagerbar.spirit:
				case this._buttonbar.spirit:
					this._hittest();
					break;
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
		 * @returns {this}
		 */
		hideActions: chained(function() {
			this._actionbar().hide();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		showActions: chained(function() {
			this._actionbar().show();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		hidePager: chained(function() {
			this._pagerbar().hide();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		showPager: chained(function() {
			this._pagerbar().show();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		hideButtons: chained(function() {
			this._buttonbar().hide();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		showButtons: chained(function() {
			this._buttonbar().show();
			this._globallayout();
		}),

		// Private .................................................................

		/**
		 * @type {Function}
		 */
		_oncheckboxclick: null,

		/**
		 * Get the buttonbar, at the very bottom (create it if needed).
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		_buttonbar: function buttonbar() {
			if (!buttonbar.spirit) {
				buttonbar.spirit = this.dom.append(ts.ui.StatusBarSpirit.summon());
				buttonbar.spirit.life.add(gui.LIFE_RENDER, this);
				this.action.add(ts.ui.ACTION_STATUSBAR_LEVEL);
				this.css.add('has-buttonbar');
				this._globallayout();
			}
			return buttonbar.spirit;
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
		 * Get the pagerbar (create it if needed).
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_pagerbar: function pagerbar() {
			if (!pagerbar.spirit) {
				var spirit = ts.ui.StatusBarSpirit.summon();
				var target = null;
				if ((target = this._buttonbar.spirit)) {
					spirit.dom.insertBefore(target);
				} else if ((target = this._actionbar.spirit)) {
					spirit.dom.insertAfter(target);
				} else {
					this.dom.append(spirit);
				}
				this.css.add('has-pagerbar');
				spirit.life.add(gui.LIFE_RENDER, this);
				pagerbar.spirit = spirit;
				this._globallayout();
			}
			return pagerbar.spirit;
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
			var footer = this._buttonbar.spirit;
			var action = this._actionbar.spirit;
			var pagerb = this._pagerbar.spirit;
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

		_hittest: function() {
			var pbar = this._pagerbar.spirit;
			var bbar = this._buttonbar.spirit;
			var list = null;
			if (pbar) {
				list = pbar.buttons();
				if (list.length) {
					console.log('has buttons in pager');
					conflict = hittest(pbar, pbar);
					console.log('conflict', conflict);
					if (conflict) {
						this.buttons(GuiArray.from(list));
						list.clear();
					}
				} else if (bbar) {
					console.log('has buttos in buttons');
					list = bbar.buttons();
					if (list.length) {
						conflict = hittest(pbar, bbar);
						console.log('conflict', conflict);
						if (!conflict) {
							this.buttons(GuiArray.from(list));
							list.clear();
							bbar.dom.hide();
						}
					}
				}
			}
		}
	});
})(gui.Combo.chained, gui.Array);
