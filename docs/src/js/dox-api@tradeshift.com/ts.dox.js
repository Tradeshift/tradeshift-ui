/**
 * Namespace object.
 */
ts.dox = gui.namespace(
	'ts.dox',
	(function() {
		/**
		 * This is decidedly *not* the case upon GitHub pages.
		 */
		var islocalhost = location.port === '10114';

		/**
		 * Get magic URL that will instruct the chrome to load next
		 * page as a new app. The URL is supposed to look like the
		 * URL the user sees in the addressbar except it must start
		 * with "go.tradeshift.com" instead of localhost or whatever
		 * (please assume here that we're not using #hash navigation).
		 * @param {string} foldername
		 * @param {string} filename
		 * @returns {string}
		 */
		function getmagicurl(foldername, filename) {
			// redirect from ui.tradeshift.com adds an extra `/` in the foldername :(
			foldername = foldername.replace(/\/+/g, '/');
			foldername = foldername.split('/dist/')[1];
			return foldername + filename;
		}

		/**
		 * If only one tab is visible on GitHub pages, there's no
		 * need to show the tabs. The tabs might still be shown
		 * on localhost (to reveal test pages and stuff).
		 * @param {Array} tabs
		 * @returns {boolean}
		 */
		function hasrelevant(tabs) {
			return tabs.filter(visibletab).length > 1;
		}

		/**
		 * Tab should be visible?
		 * 1) All tabs should be visible on localhost, for you and I to see
		 * 2) But they should also be visible when the page is loaded standalone
		 *		(without the chrome) so that we can show stuff online on a "secret"
		 *		URL without the page automatically loading the first *visible* tab.
		 * @param {Array} tab
		 * @returns {boolean}
		 */
		function visibletab(tab) {
			if (tab[2] === true) {
				return islocalhost || !gui.hosted;
			}
			return true;
		}

		/**
		 * @param {Array} tab
		 * @param {string} file
		 * @param {string} fold
		 * @param {number} indx
		 * @param {boolean} hide
		 */
		function createtab(tab, file, fold, indx, hide) {
			var label = tab[0];
			var href = tab[1];
			var icon = hide ? 'ts-icon-locked' : null;
			var magicurl = getmagicurl(fold, href);
			var selected = href === file || (indx && href === 'index.html');
			return new Tab(label, icon, magicurl, selected);
		}

		/**
		 * Tab configuration.
		 * @param {string} label
		 * @param {string} icon
		 * @param {string} href
		 * @param {boolean} selected
		 */
		function Tab(label, icon, href, selected) {
			this.icon = icon;
			this.label = label;
			this.selected = selected;
			this.onselect = function() {
				if (!selected) {
					if (gui.hosted) {
						top.location.hash = href;
					} else {
						location.href = '/dist/' + href;
					}
				}
			};
		}

		/**
		 * Convert titled `link rel="prefetch` tags into TopMenu tabs.
		 * @returns {Array<object>}
		 */
		function parselinks() {
			var tabs = document.head.querySelectorAll('link[rel=prefetch]');
			return gui.Array.from(tabs)
				.filter(function(link) {
					return !!link.getAttribute('title');
				})
				.map(function(link) {
					return [
						link.getAttribute('title'),
						link.getAttribute('href'),
						link.className.includes('hidden')
					];
				});
		}

		return {
			// Public ...........................................................

			/**
			 * Toggled by the {ts.dox.ChromeSpirit} when the iframe is loaded.
			 * @type {boolean}
			 */
			booting: true,

			/**
			 *
			 */
			title: function(title) {
				ts.ui.Header.title(title);
			},

			/**
			 * Show those tabs. Omit the argument to build from `link` tags in HEAD
			 * @param @optional {Array<Array>} tabs (can be omitted)
			 */
			tabs: function(tabs) {
				tabs = tabs || parselinks();
				if (tabs.length) {
					var path = location.pathname;
					var file = path.substring(path.lastIndexOf('/') + 1);
					var fold = path.replace(file, '');
					var indx = file === '';
					if (hasrelevant(tabs)) {
						ts.ui.Header.tabs(
							tabs.filter(visibletab).map(function(tab) {
								return createtab(tab, file, fold, indx, tab[2] === true);
							})
						);
					}
				}
			}
		};
	})()
);
