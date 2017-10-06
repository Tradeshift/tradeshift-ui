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
	/**
	 * Reduce to heighest panel.
	 * @param {number} max
	 * @parapm {ts.ui.PanelSpirit}
	 */
	function maxheight(max, next) {
		var was = next.dom.visible;
		next.dom.visible = true;
		var fit = next.box.height;
		next.dom.visible = was;
		return fit > max ? fit : max;
	}

	return ts.ui.Spirit.extend(
		{
			title: chained(function(title) {
				console.log('TODO: TITLE');
			}),

			icon: chained(function(icon) {
				console.log('TODO: TITLE');
			}),

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

			/*
		 * Equalsize panels height to match the highest panel.
		 * @param {boolean} enable
		 * @returns {this}
		 */
			equalsize: chained(function(enable) {
				var panels = this.dom.child(PanelsSpirit);
				if (panels && (panels = panels.dom.children(PanelSpirit)).length) {
					var height = panels.reduce(maxheight, 0);
					panels.forEach(function(p) {
						p.css.height = enable ? height : '';
					});
				}
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
			$selectTab: function(panel) {},

			// Private .................................................................

			/**
		 * @returns {ts.ui.TabBarSpirit}
		 */
			_head: function() {
				return ts.ui.BoxSpirit.minorHeader(this);
			}
		},
		{
			// XStatic ..............................................................
		},
		{
			// Static ...............................................................

			/**
		 * @param {ts.ui.BoxSpirit} box
		 * @returns {ts.ui.ToolBarSpirit}
		 */
			minorHeader: function(box) {
				box.css.add(['ts-has-header', 'ts-has-header-minor']);
				return (
					box.dom.child(ToolBarSpirit) ||
					box.dom.prepend(ToolBarSpirit.summon('header', 'ts-micro'))
				);
			},

			/**
		 * @param {ts.ui.BoxSpirit} box
		 * @returns {ts.ui.HeaderBarSpirit}
		 */
			majorHeader: function(box) {
				box.css.add(['ts-has-header', 'ts-has-header-major']);
				box.action.add(ts.ui.ACTION_HEADER_LEVEL);
				return box.dom.child(HeaderBarSpirit) || box.dom.prepend(HeaderBarSpirit.summon());
			},

			/**
		 * @param {ts.ui.BoxSpirit} box
		 * @returns {ts.ui.FooterBarSpirit}
		 */
			majorFooter: function(box) {
				box.css.add(['ts-has-footer', 'ts-has-footer-minor']);
				box.action.add(ts.ui.ACTION_FOOTER_LEVEL);
				return box.dom.child(FooterBarSpirit) || box.dom.append(FooterBarSpirit.summon());
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
