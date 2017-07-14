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
	 * Pager and (buttons) menu overlap?
	 * @param {ts.ui.ToolBarSpirit} bar1 - the pagerbar
	 * @param {ts.ui.ToolBarSpirit} bar2 - the pagerbar OR the bonusbar
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
		 * Add local and global classname.
		 */
		onenter: function() {
			this.super.onenter();
			this.css.add('ts-mainfooter ts-bg-lite');
			this.guilayout.shiftGlobal(true, 'ts-has-footer');
		},

		/**
		 *
		 */
		onflex: function() {
			this.super.onflex();
			this._hittest();
		},

		/**
		 * @param {ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(buttons) {
			/*
			var has = this._pagerbar.spirit && this._pagerbar().pager();
			var bar = has ? this._renderbar() : this._pagerbar();
			if (arguments.length) {	
				bar.buttons(buttons);
			} else {
				return bar.buttons();
			}
			*/
			var bar = conflict ? this._bonusbar() : this._pagerbar();
			if (arguments.length) {
				bar.buttons(buttons);
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
		 * Handle life.
		 * @param {gui.Life} l
		 */
		onlife: function(l) {
			this.super.onlife(l);
			if (l.type === gui.LIFE_RENDER) {
				switch (l.target) {
					case this._pagerbar.spirit:
					case this._bonusbar.spirit:
						this._hittest();
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
		 * @returns {this}
		 */
		hideActions: chained(function() {
			this.css.remove('has-actionbar');
			this._actionbar().hide();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		showActions: chained(function() {
			this.add.add('has-actionbar');
			this._actionbar().show();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		hidePager: chained(function() {
			this.css.remove('has-pagerbar');
			this._pagerbar().hide();
			this._globallayout();
		}),

		/**
		 * @returns {this}
		 */
		showPager: chained(function() {
			this.css.add('has-actionbar');
			this._pagerbar().show();
			this._globallayout();
		}),

		// Private .................................................................

		/**
		 * @type {Function}
		 */
		_oncheckboxclick: null,

		/**
		 * Get the bonusbar, at the very bottom (create it if needed).
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		_bonusbar: function bonusbar() {
			if (!bonusbar.spirit) {
				bonusbar.spirit = this.dom.append(ts.ui.StatusBarSpirit.summon());
				bonusbar.spirit.life.add(gui.LIFE_RENDER, this);
				this.action.add(ts.ui.ACTION_STATUSBAR_LEVEL);
				this.css.add('has-bonusbar');
				this._globallayout();
			}
			return bonusbar.spirit;
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
				if ((target = this._bonusbar.spirit)) {
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

		_renderbar: function renderbar() {
			if (!renderbar.spirit) {
				renderbar.spirit = this.dom.before(ts.ui.ToolBarSpirit.summon());
				renderbar.spirit.life.add(gui.LIFE_RENDER, this);
			}
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
			var footer = this._bonusbar.spirit;
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

		/**
		 * Hide the bonus bar.
		 * @returns {this}
		 */
		_hideBonus: chained(function() {
			this.css.remove('has-bonusbar');
			this._bonusbar().hide();
			this._globallayout();
		}),

		/**
		 * Show the bonus bar.
		 * @returns {this}
		 */
		_showBonus: chained(function() {
			this.css.add('has-bonusbar');
			this._bonusbar().show();
			this._globallayout();
		}),

		/**
		 * TODO: The suspend operation should not really be performed here.
		 */
		_hittest: function hittest() {
			var pager = this._pagerbar.spirit;
			var bonus = this._bonusbar.spirit;
			if (pager && pager.pager()) {
				if (!hittest.suspended) {
					hittest.suspended = true;
					this._actuallyhittest(pager, bonus);
					this.tick.time(function reset() {
						hittest.suspended = false;
					}, 50);
				}
			}
		},

		/**
		 * If conflict, call `buttons` again (this will account for the conflict).
		 * @param {ts.ui.StatusBarSpirit} pager
		 * @param {ts.ui.ToolBarSpirit} [bonus]
		 */
		_actuallyhittest: function(pager, bonus) {
			var list = pager.buttons();
			if (list.length) {
				conflict = hittest(pager, pager);
				if (conflict) {
					this.buttons(GuiArray.from(list));
					list.clear();
					this._showBonus();
				}
			} else if (bonus && (list = bonus.buttons()).length) {
				conflict = hittest(pager, bonus);
				if (!conflict) {
					this.buttons(GuiArray.from(list));
					list.clear();
					this._hideBonus();
				}
			}
		}
	});
})(gui.Combo.chained, gui.Array);
