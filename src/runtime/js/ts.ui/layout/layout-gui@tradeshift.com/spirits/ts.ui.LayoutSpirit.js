/**
 * This things acts as base spirit for a number of widgets to ensure consistent
 * handling of toolbars, headers and footers plus basic CSS (via flex features).
 * @see {AppSpirit}
 * @see {SideShowSpirit}
 * @see {BoardSpirit}
 * @see {ContentSpirit}
 * @see {ModalSpirit}
 * @using {ts.ui.ToolBarSpirit} ToolBarSpirit
 * @using {ts.ui.HeaderBarSpirit} HeaderBarSpirit
 * @using {ts.ui.FooterBarSpirit} FooterBarSpirit
 * @using {ts.ui.PanelsSpirit} PanelsSpirt
 * @using {ts.ui.PanelSpirit} PanelSpirit
 * @using {gui.Combo#chained} chained
 */
ts.ui.LayoutSpirit = (function using(
	ToolBarSpirit,
	HeaderBarSpirit,
	FooterBarSpirit,
	PanelsSpirit,
	PanelSpirit,
	chained
) {
	/**
	 * @param {ts.ui.LayoutSpirit} layout
	 * @param {ts.ui.ToolBarSpirit} [toolbar]
	 * @returs {ts.ui.ToolBarSpirit}
	 */
	function gettoolbar(layout, toolbar) {
		layout.css.add(['ts-has-header']);
		return (
			layout.dom.child(ToolBarSpirit) ||
			layout.dom.prepend(toolbar || ToolBarSpirit.summon('header'))
		);
	}

	/**
	 * @param {ts.ui.LayoutSpirit} layout
	 * @param {ts.ui.HeaderBarSpirit} [header]
	 * @returs {ts.ui.HeaderBarSpirit}
	 */
	function getheader(layout, header) {
		layout.css.add(['ts-has-header']);
		layout.action.add(ts.ui.ACTION_HEADER_LEVEL);
		return (
			layout.dom.child(HeaderBarSpirit) || layout.dom.prepend(header || HeaderBarSpirit.summon())
		);
	}

	/**
	 * @param {ts.ui.LayoutSpirit} layout
	 * @param {ts.ui.FooterBarSpirit} [footer]
	 * @returs {ts.ui.FooterBarSpirit}
	 */
	function getfooter(layout, footer) {
		layout.css.add(['ts-has-footer']);
		layout.action.add(ts.ui.ACTION_FOOTER_LEVEL);
		return (
			layout.dom.child(FooterBarSpirit) || layout.dom.append(footer || FooterBarSpirit.summon())
		);
	}

	return ts.ui.Spirit.extend(
		{
			/**
			 * The spirit is not channelled, so we'll attach classname manually.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.css.add('ts-layout');
			},

			/**
			 * @TODO: finalize this
			 */
			title: chained(function(title) {
				this._head().title(title);
			}),

			/**
			 * @TODO: finalize this
			 */
			icon: chained(function(icon) {
				this._head().icon(icon);
			}),

			/**
			 * @TODO: finalize this
			 * @TODO: SEARCH
			 */
			search: chained(function(search) {}),

			/**
			 * Get or set the buttons in the statusbar.
			 * so will simply not allow that.
			 * @param @optional {Array<Object>} json
			 * @returns {ts.ui.ButtonsCollection|ts.ui.ModalSpirit}
			 */
			buttons: chained(function(json) {
				var bar = this._head();
				if (arguments.length) {
					bar.buttons(json);
				} else {
					return bar.buttons();
				}
			}),

			/**
			 * Get or set the tabs.
			 * @param @optional {Array<Object>} json
			 * @returns {Array<ts.ui.TabModel>|ts.ui.ModalSpirit}
			 */
			tabs: chained(function(json) {
				var bar = this._head();
				if (arguments.length) {
					bar.tabs(json);
				} else {
					return bar.tabs();
				}
			}),

			/**
			 * Hm, this should then affect both the header and the potential footer?
			 * @returns {this}
			 */
			uncompact: chained(function() {
				this._head().uncompact();
			}),

			/**
			 * Relevant for subclasses that use major headers or footer.
			 * @see {ts.ui.SideShowSpirit}
			 * @see {ts.ui.ModalSpirit}
			 * @param {gui.Action} a
			 */
			onaction: function(a) {
				this.super.onaction(a);
				switch (a.type) {
					case ts.ui.ACTION_HEADER_LEVEL:
						this.guilayout.gotoLevel(a.data, 'ts-header-level');
						a.consume();
						break;
					case ts.ui.ACTION_FOOTER_LEVEL:
						this.guilayout.gotoLevel(a.data, 'ts-footer-level');
						a.consume();
						break;
				}
			},

			// Privileged ..............................................................

			/**
			 * Called by the {ts.ui.PanelsPlugin} to append a tab.
			 * @param {Object} json
			 * @param {number} index
			 */
			$insertTab: function(json, index) {
				var tabs = this._head().tabs();
				tabs.splice(index, 0, json);
			},

			/**
			 * Called by the {ts.ui.PanelsPlugin} when a tab is selected.
			 * @param {ts.ui.PanelSpirit} panel - The associated panel (not the tab!)
			 */
			$selectTab: function(panel) {
				/*
				var indx = panel.dom.ordinal();
				var tabs = this._head().tabs();
				tabs.selectedIndex = indx;
				*/
			},

			// Private .................................................................

			/**
			 * @returns {ts.ui.TabBarSpirit}
			 */
			_head: function() {
				return ts.ui.LayoutSpirit.microToolBar(this);
			}
		},
		{
			// XStatic ..............................................................
		},
		{
			// Static ...............................................................

			/**
			 * Setup header using a micro ToolBar.
			 * @param {ts.ui.LayoutSpirit} layout
			 * @param {ts.ui.ToolBarSpirit} [toolbar]
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			microToolBar: function(layout, toolbar) {
				return gettoolbar(layout, toolbar).micro();
			},

			/**
			 * Setup header using a macro ToolBar.
			 * @param {ts.ui.LayoutSpirit} layout
			 * @param {ts.ui.ToolBarSpirit} [toolbar]
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			macroToolBar: function(layout, toolbar) {
				return gettoolbar(layout, toolbar).macro();
			},

			/**
			 * Setup header using a micro HeaderBar.
			 * @param {ts.ui.LayoutSpirit} layout
			 * @param {ts.ui.HeaderBarSpirit} [footer]
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
			microHeader: function(layout, header) {
				return getheader(layout, header).micro();
			},

			/**
			 * Setup header using a macro HeaderBar.
			 * @param {ts.ui.LayoutSpirit} layout
			 * @param {ts.ui.HeaderBarSpirit} [footer]
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
			macroHeader: function(layout, header) {
				return getheader(layout, header).macro();
			},

			/**
			 * Setup footer using a macro FooteBar.
			 * @param {ts.ui.LayoutSpirit} layout
			 * @param {ts.ui.FooterBarSpirit} [footer]
			 * @returns {ts.ui.FooterBarSpirit}
			 */
			macroFooter: function(layout, footer) {
				return getfooter(layout, footer).macro();
			}
		}
	);
})(
	ts.ui.ToolBarSpirit,
	ts.ui.HeaderBarSpirit,
	ts.ui.FooterBarSpirit,
	ts.ui.PanelsSpirit,
	ts.ui.PanelSpirit,
	gui.Combo.chained
);
