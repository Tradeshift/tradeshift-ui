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

	/**
	 * Is mobile breakpoint?
	 * @returns {string}
	 */
	function ismobile() {
		return document.documentElement.classList.contains(ts.ui.CLASS_MOBILE_ONLY);
	}

	return ts.ui.BoxSpirit.extend(
		{
			onconstruct: function() {
				this.super.onconstruct();
				this.event.add('ts-breakpoint', document);
				this._onbreakpoint();
			},

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
			},

			/**
			 * Handle breakpoint.
			 */
			_onbreakpoint: function() {
				if (ismobile()) {
					console.log('MOBILE BREAKPOINT');
				} else {
					console.log('NOT MOBILE BREAKPOINT');
				}
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
					var app = ts.ui.AppSpirit.$spirit();
					if (app) {
						app.$inject();
					}
				});
				return bar;
			},

			/**
			 * TODO: Let's do this...
			 * @param {number} offset
			 */
			$scroll: function(offset) {
				console.log(offset);
			},

			/**
			 * No need to query the DOM for all enternity.
			 * @returns {ts.ui.AppSpirit}
			 */
			$spirit: function cached() {
				return cached.spirit || (cached.spirit = ts.ui.get('.ts-app'));
			}
		}
	);
})();
