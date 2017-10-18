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

	return ts.ui.BoxSpirit.extend(
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

			// Private ...............................................................

			/**
			 * Make sure to use the main header.
			 * @overwrites {ts.ui.BoxSpirit#_head}
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
			_head: function() {
				return ts.ui.BoxSpirit.majorHeader(this, appheader());
			},

			/**
			 * Make sure to use the main footer.
			 * @overwrites {ts.ui.BoxSpirit#_foot}
			 * @returns {ts.ui.FooterBarSpirit}
			 */
			_foot: function() {
				return ts.ui.BoxSpirit.majorFooter(this, appfooter());
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
					ts.ui.AppSpirit.$spirit().$inject();
				});
				return bar;
			},

			/**
			 * Let's cache this lookup.
			 * @returns {ts.ui.AppSpirit}
			 */
			$spirit: function cached() {
				return cached.spirit || (cached.spirit = ts.ui.get('.ts-app'));
			}
		}
	);
})();
