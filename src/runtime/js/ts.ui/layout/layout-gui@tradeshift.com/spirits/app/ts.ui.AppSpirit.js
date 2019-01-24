/**
 * Spirit of the app.
 */
ts.ui.AppSpirit = (function() {
	/**
	 * Main header (configured via API).
	 * @returns {ts.ui.HeaderBarSpirit}
	 */
	function appheader() {
		return ts.ui.Header.$spirit();
	}

	/**
	 * Main footer (configured via API).
	 * @returns {ts.ui.FooterBarSpirit}
	 */
	function appfooter() {
		return ts.ui.Footer.$spirit();
	}

	return ts.ui.LayoutSpirit.extend(
		{
			/**
			 * Handle event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				this._onbreakpoint();
			},

			// Privileged ............................................................

			/**
			 * Inject any header and footer that might have been configured by now.
			 */
			$inject: function() {
				appheader() && this._head();
				appfooter() && this._foot();
			},

			/**
			 * Called by the {ts.ui.PanelsPlugin} when a Main (in Mains) is selected.
			 * Scroll the "sticky header" in mobile breakpoint so that it never shows
			 * a weird, empty space (margin) in the top of the newly selected panel.
			 * @param {ts.ui.PanelSpirit} panel - The associated panel (not the tab!)
			 */
			$selectTab: function(panel) {
				this.super.$selectTab(panel);
				ts.ui.Header.$scroll(panel.element.scrollTop);
			},

			// Private ...............................................................

			/**
			 * Make sure to use the main header.
			 * @overwrites {ts.ui.LayoutSpirit#_head}
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
			_head: function() {
				return ts.ui.LayoutSpirit.macroHeader(this, appheader());
			},

			/**
			 * Make sure to use the main footer.
			 * @overwrites {ts.ui.LayoutSpirit#_foot}
			 * @returns {ts.ui.FooterBarSpirit}
			 */
			_foot: function() {
				return ts.ui.LayoutSpirit.macroFooter(this, appfooter());
			}
		},
		{
			// Static ................................................................

			/**
			 * Instruct the the AppSpirit to inject the
			 * Header and Footer as soon as possible.
			 * @param {ts.ui.MajorBarSpirit} bar
			 * @returns {ts.ui.MajorBarSpirit}
			 */
			$inject: function(bar) {
				ts.ui.ready(function inject() {
					ts.ui.AppSpirit.$spirit(function(spirit) {
						spirit.$inject();
					});
				});
				return bar;
			},

			/**
			 * Apply action if indeed the {AppSpirit} exists.
			 * @param {Function} action
			 * @returns {*}
			 */
			$spirit: function cached(action) {
				var spirit = cached.spirit || (cached.spirit = ts.ui.get('.ts-app'));
				return action(spirit);
			}
		}
	);
})();
