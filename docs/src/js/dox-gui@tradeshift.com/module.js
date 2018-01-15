/**
 * Dox GUI module.
 */

(function scoped() {
	/**
	 * Hilite marker.
	 * @type {Mark}
	 */
	var marker = null;

	/**
	 * Hilite config.
	 * @see https://markjs.io/
	 */
	var config = {
		done: function() {
			if (length) {
				document.querySelector('mark').scrollIntoView(false);
			}
		}
	};

	/**
	 * Hilite that text.
	 * @param {string} text
	 */
	function hilite(text) {
		marker = marker || new Mark(document.body);
		marker.mark(text, config);
	}

	/**
	 * Clear old hilite.
	 */
	function nolite() {
		if (marker) {
			marker.unmark();
		}
	}

	/*
	 * Declare the module alreay.
	 */
	gui.module('dox-gui@tradeshift.com', {
		/**
		 * Channeling spirits to CSS selectors.
		 */
		channel: [
			['[data-ts=DoxChrome]', ts.dox.ChromeSpirit],
			['[data-ts=DoxSideBar]', ts.dox.SideBarSpirit],
			['[data-ts=DoxMenu]', ts.dox.MenuSpirit],
			['[data-ts=DoxItem]', ts.dox.ItemSpirit],
			['[data-ts=DoxSubMenu]', ts.dox.SubMenuSpirit],
			['[data-ts=DoxMenuCover]', ts.dox.MenuCoverSpirit],
			['[data-ts=DoxVersions]', ts.dox.VersionsSpirit],
			['[data-ts=DoxMarkup]', ts.dox.MarkupSpirit],
			['[data-ts=DoxScript]', ts.dox.JavaScriptSpirit],
			['[data-ts=DoxApi]', ts.dox.ApiTableSpirit],
			['[data-ts=Button]', ts.dox.LinkSpirit]
		],

		/**
		 * Setup section-specific classname for styling (although not used).
		 */
		oncontextinitialize: function() {
			if (gui.hosted) {
				this._sectionclassname(location.href);
			}
		},

		/**
		 * Highlight search query and maybe log performance metrics to console.
		 */
		onafterspiritualize: function() {
			if (gui.hosted) {
				this._hilitesearch('?query=');
				gui.Tick.time(
					function postponed() {
						// make sure we catch all metrics
						this._debugmetrics('metrics');
					},
					0,
					this
				);
			}
		},

		/**
		 * Extract the section name from the URL and
		 * attach it as a classname on the HTML tag
		 * so we can style this section amazingly.
		 * @param {string} href
		 */
		_sectionclassname: function(href) {
			var rest = href.split('/dist/')[1];
			var root = document.documentElement;
			if (rest && rest.length) {
				gui.CSSPlugin.add(root, rest.split('/')[0]);
			}
		},

		/**
		 * Highlight search query.
		 * @param {string} pattern
		 */
		_hilitesearch: function(pattern) {
			if (location.search.includes(pattern)) {
				hilite(location.search.split(pattern)[1]);
			}
			gui.Broadcast.addGlobal('dox-search-query', {
				onbroadcast: function(b) {
					nolite();
					if (b.data) {
						hilite(b.data);
					}
				}
			});
		},

		/**
		 * Log performance metrics to console.
		 * @param {string} pattern
		 */
		_debugmetrics: function(pattern) {
			/*
			if (top.location.search.includes(pattern)) {
				var times = gui.$measurements().sort(function(a, b) {
					return b.duration >= a.duration ? 1 : -1;
				});
				if (times.length) {
					console.debug('\n' + document.title);
					if (console.table) {
						console.table(
							times.map(function(m) {
								return {
									'What happened': m.name,
									'For how long': m.duration
								};
							})
						);
					} else {
						console.log(
							times
								.map(function(m) {
									return '	' + m.name + ': ' + m.duration;
								})
								.join('\n')
						);
					}
				}
			}
			*/
		}
	});
})();
