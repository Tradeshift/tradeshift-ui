/**
 * Manage root level Panel components that may generate TopBar tabs.
 * @using {gui.MapList} MapList
 * @using {gui.Array} GuiArray
 */
ts.ui.DocumentPanelPlugin = (function using(MapList, GuiArray) {
	/**
	 * Has root level panels?
	 * @type {boolean}
	 */
	var haspanels = false;

	/**
	 * Currently shown root panel (if any).
	 * @type {ts.ui.PanelSpirit}
	 */
	var shownpanel = null;

	/**
	 * Mapping class names to root panels by `$instanceid`
	 * (or if no such panels, to the root DocumentSpirit).
	 * @type {MapList<string, Array<string>}
	 */
	var classnames = new MapList();

	/*
	 * Use dramatic pause between tab shift so that the menu animation
	 * is nice and smooth? This is not enabled upon initial rendering.
	 * @type {boolean}
	 */
	var pausetabs = false;

	/**
	 * Toggle selected panel. In mobile breakpoint,
	 * we will allow the tabs menu to close first.
	 * @param {ts.ui.PanelSpirit} panel
	 * @param {ts.ui.DocumentSpirit} root
	 */
	function toggle(panel, root) {
		if (pausetabs && ts.ui.isMobilePoint()) {
			gui.Tick.time(function tabsclosed() {
				update(panel, shownpanel, root);
			}, ts.ui.TRANSITION_FAST);
		} else {
			update(panel, shownpanel, root);
		}
		pausetabs = true;
	}

	/**
	 * Show that panel, hide other panel.
	 * @param {ts.ui.PanelSpirit} newpanel
	 * @param {ts.ui.PanelSpirit} oldpanel
	 * @param {ts.ui.DocumentSpirit} root
	 */
	function update(newpanel, oldpanel, root) {
		var main = newpanel.dom.q('.ts-main');
		if (oldpanel) {
			oldpanel.hide();
		}
		newpanel.show();
		if (main) {
			main.scrollTop = 0;
			trackbars(newpanel, main, root);
		}
	}

	/**
	 * Instruct the floating bars (that you see in mobile breakpoint)
	 * to track the scrolling of the Main element in selected Panel.
	 * @param {ts.ui.PanelSpirit} panel
	 * @param {HTMLMainElement}	main
	 * @param {ts.ui.DocumentSpirit} root
	 */
	function trackbars(panel, main, root) {
		var topbar = root.dom.qdoc('.ts-topbar', ts.ui.TopBarSpirit);
		var toolbar = panel.dom.q('.ts-toolbar-first', ts.ui.ToolBarSpirit);
		[toolbar, topbar].forEach(function(bar) {
			if (bar) {
				bar.$setmain(main);
			}
		});
	}

	/**
	 * Add or remove classname from while observering the followin guidelines:
	 * 1. Add classname to array and increment a counter for that classname.
	 * 2. Remove classname from array only if counter decrement reaches zero.
	 * ... this will allow many simultaneous components to affect global css.
	 * @param {Array} list
	 * @param {string} c (classname)
	 * @param {boolean} on
	 */
	function updatelist(list, c, on) {
		var mod = on ? 1 : -1;
		if (isNaN(list[c])) {
			list[c] = 0;
		}
		list[c] += mod;
		if (on) {
			if (list[c] === 1) {
				list.push(c);
			}
		} else {
			if (list[c] === 0) {
				GuiArray.remove(list, list.indexOf(c));
			}
		}
	}

	return ts.ui.Plugin.extend({
		/**
		 * Setup panel management. If no root level panels can be
		 * found, we'll treat the root element as a panel (internally).
		 */
		managepanels: function() {
			classnames.set(this.spirit.$instanceid, []);
			this.spirit.action.add(ts.ui.ACTION_ROOT_CLASSNAMES, this);
		},

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			switch (a.type) {
				/*
				 * TODO: Deprecate all these;
				 *
				case ts.ui.ACTION_PANEL_ATTACH:
					if (isroot) {
						this._enterpanel(a.target);
					}
					break;
				case ts.ui.ACTION_PANEL_SHOW:
					if (isroot) {
						this._showpanel(a.target);
					}
					break;
				case ts.ui.ACTION_PANEL_HIDE:
					if (isroot) {
						this._hidepanel(a.target);
					}
					break;
				*/
				case ts.ui.ACTION_ROOT_CLASSNAMES:
					var data = a.data;
					this._togglecss(data.enabled, data.classes, data.relatedPanel);
					break;
			}
		},

		/**
		 * Has root level panels?
		 * @returns {boolean}
		 */
		haspanels: function() {
			return haspanels;
		},

		// Private .................................................................

		/**
		 * Root level panel entered. If `label` or `icon` was specified,
		 * we'll add some TopBar tabs to toggle the panels visibility.
		 * TODO(jmo@): Make sure that panels can be added asynchronously
		 * because in Angular, everything is always added asynchronously.
		 * @param {ts.ui.PanelSpirit} panel
		 */
		_enterpanel: function(panel) {
			haspanels = true;
			classnames.set(panel.$instanceid, []);
			var index = panel.dom.ordinal();
			var shown = panel.selected;
			if (shown) {
				shownpanel = panel;
			} else {
				panel.hide();
			}
			if (panel.label || panel.icon) {
				this._insertab(panel, index, shown);
				this._quickfixlayout();
			}
		},

		/**
		 * Root level panel was shown (probably becuase the associated
		 * Tab was selected) so we'll add the associated classnames.
		 * @param {ts.ui.PanelSpirit} panel
		 */
		_showpanel: function(panel) {
			shownpanel = panel;
			this.spirit.css.add(classnames.get(panel.$instanceid));
		},

		/**
		 * Root level panel was hidden, remove the associated classnames.
		 * @param {ts.ui.PanelSpirit} panel
		 */
		_hidepanel: function(panel) {
			shownpanel = shownpanel === panel ? null : shownpanel;
			this.spirit.css.remove(classnames.get(panel.$instanceid));
		},

		/**
		 * Add or remove CSS classnames on the HTML element.
		 * @param {boolean} on
		 * @param {Array<string>} classes
		 * @param {ts.ui.PanelSpirit} panel Root level panel (otherwise null)
		 */
		_togglecss: function(on, classes, panel) {
			var root = this.spirit;
			var guid = panel ? panel.$instanceid : root.$instanceid;
			var list = classnames.get(guid);
			var snap = GuiArray.from(list);
			classes.forEach(function(c) {
				updatelist(list, c, on);
			});
			list = on
				? list
				: snap.filter(function(clas) {
						return list.indexOf(clas) === -1;
					});
			if (panel) {
				if (panel === shownpanel) {
					root.css.shift(on, list);
				}
			} else {
				root.css.shift(on, list);
			}
		},

		/**
		 * Add tab at given index to show the given panel.
		 * @param {ts.ui.PanelSpirit} panel
		 * @param {number} index
		 * @param {boolean} selected
		 */
		_insertab: function(panel, index, selected) {
			var tabs = ts.ui.TopBar.tabs();
			var root = this.spirit;
			tabs.splice(index, 0, {
				label: panel.label,
				icon: panel.icon,
				selected: selected,
				$onselect: function() {
					toggle(panel, root);
				}
			});
		},

		/**
		 * Quickly hack classnames so that the layout doesn't jump.
		 * TODO: This trick should be deployed on a deeper level
		 * so that we never jump whenever the TopBar gets shown.
		 */
		_quickfixlayout: function() {
			this.spirit.css.add('ts-has-topbar ts-has-topbar-tabs');
		}
	});
})(gui.MapList, gui.Array);
