/**
 * Spirit of the main element.
 * @using {gui.Type} Type
 * @using {string} PANEL_ATTACH
 * @using {string} PANEL_DETACH
 */
ts.ui.MainSpirit = (function using(Type, PANEL_ATTACH, PANEL_DETACH) {
	
	/**
	 * The TopBar and ToolBar and TabBar share inheritance chain, 
	 * se we'll need an elaborate setup to distinguish them apart.
	 * @param {ts.ui.MainSpirit} main
	 * @param {Constructor} Bar
	 */
	function preceding(main, Bar) {
		return main.dom.preceding(ts.ui.Spirit).find(function(spirit) {
			return spirit.constructor === Bar;
		});
	}
	
	/**
	 * @param {ts.ui.MainSpirit} main
	 * @param {Constructor} Bar
	 */
	function following(main, Bar) {
		return main.dom.following(ts.ui.Spirit).find(function(spirit) {
			return spirit.constructor === Bar;
		});
	}
	
	/**
	 * Setup to insert the bar only when it has any content.
	 * @see {ts.ui.ToolBarModel#_updatehascontent}
	 * @see {ts.ui.ToolBarSpirit#onchange}
	 * @param {ts.ui.BarSpirit} bar
	 * @param {function} action
	 * @param {ts.ui.MainSpirit} thisp
	 * @returns {ts.ui.BarSpirit}
	 */
	function suspended(bar, action, thisp) {
		bar.life.add('ts-life-toolbar-hascontent', {
			onlife: function() {
				action.call(thisp, bar);
			}
		});
		return bar;
	}
	
	return ts.ui.Spirit.extend({

		/**
		 * ts.ui.SpinnerSpirit.
		 */
		spin: null,

		/**
		 * @param {string} busy
		 */
		busy: function(busy) {
			var opts = {
				message: gui.Type.isString(busy) ? busy : ''
			};
			if(!busy || !this._isbusy) {
				this._initspin(busy, opts);
				if(busy){
					this.guistatus.busy(this.$instanceid);
					this._isbusy = true;
				}else {
					this.guistatus.done(this.$instanceid);
					this._isbusy = false;	
				}
			}
		},

		/**
		 * @param {string} busyblocking
		 */
		blocking: function(busyblocking) {
			var opts = {
				message: busyblocking,
				cover: true,
				color: "#fff",
			};
			this._initspin(busyblocking, opts);
			if(busyblocking){
				this.guistatus.busy(this.$instanceid);	
			}else {
				this.guistatus.done(this.$instanceid);	
			}
		},

		/**
		 * Configure.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.element.tabIndex = -1;
			this.attention.trap();
			this.action.add([
				PANEL_ATTACH,
				PANEL_DETACH
			]);
		},
		
		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			switch(a.type) {
				case PANEL_ATTACH:
				case PANEL_DETACH:
					var panel = a.target;
					var index = panel.dom.ordinal();
					var added = a.type === PANEL_ATTACH;
					if(panel.label) {
						this._updatetab(panel, index, added);
					} else {
						throw new Error('Panels in Main must have a label');
					}
					a.consume();
					break;
			}
		},
		
		/**
		 * Trap focus in the MAIN section so that TAB 
		 * won't travel into ASIDE or exit the IFRAME.
		 */
		onready: function() {
			this.super.onready();
			if(this.dom.q('.ts-main-content')) { // TODO: delete this after some releases...
				throw new Error('Classname "ts-main-content" has been renamed to "ts-maincontent"');
			}
			if(gui.debug) {
				if(this.dom.qdocall('.ts-main').length > 1) {
					console.error('Main components should not be nested :/');
				}
			}
		},

		/**
		 * If the `autofocus` element is not focused by now, we'll do just that. 
		 * TODO(jmo@): Perhaps validate that there is only one 'autofocus' arond?
		 */
		onvisible: function() {
			this.super.onvisible();
			var auto = this.dom.q('[autofocus]');
			if (auto && document.activeElement !== auto) {
				auto.focus();
			}
		},
		
		/**
		 * Get the TabBar (will be created it if it doesn't exist) 
		 * while accounting for manually created TabBar and ToolBar.
		 * TODO: Make sure that this gets inserted BEFORE the ordinary ToolBar.
		 * @returns {ts.ui.TabBarSpirit}
		 */
		tabbar: function() {
			var TabBar = ts.ui.TabBarSpirit;
			return this._tabbar || (this._tabbar = preceding(this, TabBar) ||
				suspended(TabBar.summon('header').lite(), function oncontent(tabbar) {
					var toolbar = preceding(this, ts.ui.ToolBarSpirit);
					(toolbar || this).dom.before(tabbar);
				}, this));
		},
		
		/**
		 * Get the ToolBar (will be created it if it doesn't exist) 
		 * while accounting for manually created TabBar and ToolBar.
		 * @returns {ts.ui.TabBarSpirit}
		 */
		toolbar: function() {
			var ToolBar = ts.ui.ToolBarSpirit;
			return this._toolbar || (this._toolbar = preceding(this, ToolBar) || suspended(ToolBar.summon('header'), function oncontent(toolbar) {
				var tabbar = preceding(this, ts.ui.TabBarSpirit);
				if(tabbar) {
					tabbar.dom.after(toolbar);
				} else {
					this.dom.before(toolbar);
				}
			}, this));
		},
		
		/**
		 * Get the ToolBar (will be created it if it doesn't exist) 
		 * while accounting for manually created StatusBar.
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		statusbar: function() {
			var StatusBar = ts.ui.StatusBarSpirit;
			return this._statusbar || (this._statusbar = following(this, StatusBar) ||
			suspended(StatusBar.summon('footer'), function oncontent(statusbar) {
				this.dom.after(statusbar);
			}, this));
		},
		
		
		// Private .................................................................
		
		/**
		 * The Main tabbar.
		 * @type {ts.ui.TabBarSpirit}
		 */
		_tabbar: null,
		
		/**
		 * The Main toolbar.
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_toolbar: null,
		
		/**
		 * The Main statusbar.
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_statusbar: null,
		
		/**
		 * Added or remove tab for Panel at given index.
		 * TODO: Support a `selected` property in the {ts.ui.PanelSpirit}
		 * TODO: When all panels are done, somehow force `tabbar.script.run()` ...
		 * @param {ts.ui.PanelSpirit} panel
		 * @param {number} index
		 */
		_updatetab: function(panel, index, added) {
			var css = '.ts-maincontent > .ts-panel';
			var bar = this.tabbar();
			var elm = this.element;
			var dom = this.dom;
			if(added) {
				if(index < 0) {
					panel.hide();
				}
				bar.tabs().splice(index, 0, {
					label: panel.label,
					selected: index === 0,
					$onselect: function() {
						dom.qall(css, ts.ui.PanelSpirit).forEach(function(p) {
							if(p === panel) {
								p.show();
								elm.scrollTop = 0; // TODO(jmo@): account for topbar position in mobile breakpoint
								p.$onselect();
							} else {
								p.hide();
							}
						});
					}
				});
			} else {
				bar.tabs().splice(index, 1).forEach(function(tab) {
					tab.dispose();
				});
			}
			bar.$hascontent(); // for the tabbar to render instantly
		},

		/**
		 * If you set the attribute ts.busy is true, you will see the spinner in the main
		 * param {string} busy
		 * param {object} opts
		 */
		_initspin: function(busy, opts) {
			if (!this.spin) {
				this.spin = ts.ui.SpinnerSpirit.summon();
			}
			if (busy) {
				this.spin.spin(document.body, opts);
			} else {
				this.spin.stop();
			}
		}

	});
	
}(gui.Type, ts.ui.ACTION_PANEL_ATTACH, ts.ui.ACTION_PANEL_DETACH));
