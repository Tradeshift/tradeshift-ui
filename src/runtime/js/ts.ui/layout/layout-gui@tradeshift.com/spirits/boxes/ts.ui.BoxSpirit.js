/**
 * Spirit of the box.
 * @using {ts.ui.ToolBarSpirit} ToolBarSpirit
 * @using {ts.ui.HeaderBarSpirit} HeaderBarSpirit
 * @using {ts.ui.FooterBarSpirit} FooterBarSpirit
 * @using {ts.ui.PanelsSpirit} PanelsSpirt
 * @using {ts.ui.PanelSpirit} PanelSpirit
 * @using {gui.Combo#chained} chained
 */
ts.ui.BoxSpirit = (function using(
	ToolBarSpirit,
	HeaderBarSpirit,
	FooterBarSpirit,
	PanelsSpirit,
	PanelSpirit,
	chained
) {
	return ts.ui.Spirit.extend(
		{
			/**
			 * TODO: finalize this
			 */
			title: chained(function(title) {
				this._head().title(title);
			}),

			/**
			 * TODO: finalize this
			 */
			icon: chained(function(icon) {
				this._head().icon(icon);
			}),

			/**
			 * TODO: finalize this
			 */
			search: chained(function(search) {
				console.log('TODO: SEARCH');
			}),

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
				this._head.uncompact();
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
				return ts.ui.BoxSpirit.microHeader(this);
			}
		},
		{
			// XStatic ..............................................................
		},
		{
			// Static ...............................................................

			/**
			 * Setup box header using a micro ToolBar.
			 * @param {ts.ui.BoxSpirit} box
			 * @param {ts.ui.ToolBarSpirit} [toolbar] - Optionally inject this toolbar
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			microHeader: function(box, toolbar) {
				box.css.add(['ts-has-header', 'ts-has-header-micro']);
				return (
					box.dom.child(ToolBarSpirit) ||
					box.dom.prepend(toolbar || ToolBarSpirit.summon('header', 'ts-micro'))
				);
			},

			/**
			 * Setup box header using a macro ToolBar.
			 * @param {ts.ui.BoxSpirit} box
			 * @param {ts.ui.ToolBarSpirit} [toolbar] - Optionally inject this toolbar
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			macroHeader: function(box, toolbar) {
				box.css.add(['ts-has-header', 'ts-has-header-macro']);
				return (
					box.dom.child(ToolBarSpirit) ||
					box.dom.prepend(toolbar || ToolBarSpirit.summon('header', 'ts-macro'))
				);
			},

			/**
			 * Setup box header using a  full on HeaderBar.
			 * @param {ts.ui.BoxSpirit} box
			 * @param {ts.ui.HeaderBarSpirit} [footer] - Optionally inject this header
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
			majorHeader: function(box, header) {
				box.css.add(['ts-has-header', 'ts-has-header-major']);
				box.action.add(ts.ui.ACTION_HEADER_LEVEL);
				return (
					box.dom.child(HeaderBarSpirit) || box.dom.prepend(header || HeaderBarSpirit.summon())
				);
			},

			/**
			 * Setup box footer using a mighty FooteBar.
			 * @param {ts.ui.BoxSpirit} box
			 * @param {ts.ui.FooterBarSpirit} [footer] - Optionally inject this header
			 * @returns {ts.ui.FooterBarSpirit}
			 */
			majorFooter: function(box, footer) {
				box.css.add(['ts-has-footer', 'ts-has-footer-minor']);
				box.action.add(ts.ui.ACTION_FOOTER_LEVEL);
				return box.dom.child(FooterBarSpirit) || box.dom.append(footer || FooterBarSpirit.summon());
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
