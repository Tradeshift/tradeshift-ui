/**
 * Note that the user spirit must implement `$insertTab(json, index)`.
 * TODO: Finalize setup for tabs added or removed post initialization.
 * TODO: Refactor the `SideShowSpirit` and `MainSpirit` to use this!
 */
ts.ui.PanelsPlugin = (function using(PANEL_ATTACH, PANEL_DETACH) {
	/**
	 * Get JSON object to build a tab.
	 * @param {ts.ui.Spirit} spirit
	 * @param {ts.ui.PanelSpirit} spirit
	 * @returns {Object}
	 */
	function gettab(spirit, panel) {
		return {
			label: panel.label,
			selected: panel.selected,
			$onselect: function() {
				select(spirit, panel);
			}
		};
	}

	/**
	 * Select one tab while unselecting other tabs.
	 * @param {ts.ui.Spirit} spirit
	 * @param {ts.ui.PanelSpirit} spirit
	 */
	function select(spirit, panel) {
		if (!spirit.$destructed) {
			spirit.dom.children(ts.ui.PanelSpirit).forEach(function(p) {
				if (p === panel) {
					p.show();
					p.$onselect();
					spirit.$selectTab(p);
				} else {
					p.hide();
					p.$onunselect();
				}
			});
		}
	}

	return ts.ui.Plugin.extend({
		/**
		 * Initialize those panels.
		 */
		init: function() {
			if (!this._initialized) {
				if (this.spirit.$insertTab) {
					this._initialized = true;
					this._index(this.spirit.dom.children(ts.ui.PanelSpirit));
					this.spirit.action.add([PANEL_ATTACH, PANEL_DETACH], this);
				} else {
					throw new Error('$insertTab :(');
				}
			}
		},

		/**
		 * Get the currently selected panel (or simply
		 * the first panel, if there is only only panel).
		 * @returns {ts.ui.PanelSpirit}
		 */
		current: function() {
			var panels = this._panels();
			return (
				panels.find(function(p) {
					return p.selected;
				}) || panels[0]
			);
		},

		/**
		 * Handle panels added and removed (post init).
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			switch (a.type) {
				case PANEL_ATTACH:
				case PANEL_DETACH:
					var panel = a.target;
					var added = a.type === PANEL_ATTACH;
					if (panel.label) {
						this._reindex(panel, added);
					}
					a.consume();
					break;
			}
		},

		// Private .................................................................

		/**
		 * @returns {Array<ts.ui.PanelSpirit}
		 */
		_panels: function() {
			return this.spirit.dom.children(ts.ui.PanelSpirit);
		},

		/**
		 * Index panels initially.
		 * @param {Array<ts.ui.PanelSpirit>}
		 */
		_index: function(panels) {
			var spirit = this.spirit;
			if (panels.length > 1) {
				if (
					panels.every(function(panel) {
						return !!panel.label;
					})
				) {
					panels.forEach(function(panel, index) {
						var json = gettab(spirit, panel);
						spirit.$insertTab(json, panels.length);
					});
				} else {
					throw new Error(
						'Multiple panels inside the ' + this.spirit.$classname + ' must have a label'
					);
				}
			}
		},

		/**
		 * @param {ts.ui.PanelSpirit} panel
		 * @param {boolean} added
		 */
		_reindex: function(panel, added) {
			var spirit = this.spirit;
			var index = this._panels().indexOf(panel);
			if (added) {
				var json = gettab(spirit, panel);
				spirit.$insertTab(json, index);
				if (!panel.selected) {
					panel.hide();
				}
			} else {
				// TODO: Fix this - the panel was removed!
				/*
				bar.tabs().splice(index, 1).forEach(function(tab) {
					if (tab.selected) {
						var selectedindex = index ? index - 1 : index;
						bar.tabs()[selectedindex].select();
					}
					tab.dispose();
				});
				if (bar.tabs().length === 1) {
					this._removetabbar();
				}
				*/
			}
			// bar.$hascontent(); // for the tabbar to render instantly
		}
	});
})(ts.ui.ACTION_PANEL_ATTACH, ts.ui.ACTION_PANEL_DETACH);
