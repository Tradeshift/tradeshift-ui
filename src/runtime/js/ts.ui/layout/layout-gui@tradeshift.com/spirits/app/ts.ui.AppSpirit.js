/**
 * Spirit of the app.
 */
ts.ui.AppSpirit = (function() {
	/**
	 * Main header configured via API.
	 * @returns {ts.ui.HeaderBarSpirit}
	 */
	function appheader() {
		return ts.ui.Header.$spirit();
	}

	/**
	 * Main footer configured via API.
	 * @returns {ts.ui.FooterBarSpirit}
	 */
	function appfooter() {
		return ts.ui.Footer.$spirit();
	}

	return ts.ui.BoxSpirit.extend(
		{
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
			 * Make sure to use the main header. Creates the header if it doesn't exits.
			 * @overwrites {ts.ui.BoxSpirit#_head}
			 */
			_head: function() {
				return ts.ui.BoxSpirit.majorHeader(this, appheader());
			},

			/**
			 * Make sure to use the main footer.
			 * @overwrites {ts.ui.BoxSpirit#_foot}
			 */
			_foot: function() {
				return ts.ui.BoxSpirit.majorFooter(this, appfooter());
			}
		},
		{
			// Static ................................................................

			/**
			 * Instruct the the MainSpirit to inject as soon as possible.
			 * @param {ts.ui.MajorBarSpirit} bar
			 * @returns {ts.ui.MajorBarSpirit}
			 */
			$inject: function(bar) {
				ts.ui.ready(function inject() {
					var main = ts.ui.get('.ts-app');
					if (main) {
						main.$inject();
					}
				});
				return bar;
			}
		}
	);
})();
