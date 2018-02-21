/**
 * Spirit of the Dox menu.
 * @using {function} isInView
 * @using {function} goIntoView
 */
ts.dox.MenuSpirit = (function using(isInView, goIntoView, isAppendix) {
	return ts.ui.Spirit.extend({
		/**
		 * Setup much.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.css.add('ts-menu');
			this._loadmenu(this.dom.q('script'));
		},

		/**
		 * Make sure the selected item is visible.
		 * @param {TODOType} summary
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
			if (this._newselection) {
				this._updatechecked(this.dom.q('.ts-checked'));
				this._newselection = false;
			}
		},

		/**
		 * Select appropriate item by folder path (ignoring any file name).
		 * This gets called by the {ts.dox.DoxChromeSpirit} on hashchange.
		 * @param {string} path
		 * @returns {gui.Then} Returns a "promise" in case we add animations...
		 */
		selectbestitem: function(path) {
			this._currentpath = path;
			if (this._model.searchresults) {
				this._selectsearchitem(path);
				this.script.run(); // TODO: EDBML bug - needed on second search, but why?
			} else {
				this._selectnormalitem(path);
			}
			return new gui.Then().now(this._firstselected());
		},

		/**
		 * Show search results.
		 * @param {string} query
		 * @param {Array<Object>|null} results
		 */
		showresults: function(query, results) {
			this.dom.parent().scrollTop = 0;
			this._model.searchquery = query;
			this._model.searchresults = results;
			this._selectsearchitem(this._currentpath);
		},

		/**
		 * Show the good old menu.
		 */
		showmenu: function() {
			this.dom.parent().scrollTop = 0;
			this._model.searchquery = null;
			this._model.searchresults = null;
			this._selectnormalitem(this._currentpath);
		},

		// Private .................................................................

		/**
		 * @type {ts.dox.MenuModel}
		 */
		_model: null,

		/**
		 * Snapshot latest path.
		 * @type {string}
		 */
		_currentpath: null,

		/**
		 * Render menu from embedded JSON.
		 * @param {HTMLScriptElement} script
		 */
		_loadmenu: function(script) {
			this.script.load(ts.dox.MenuSpirit.edbml);
			this.script.input(
				(this._model = new ts.dox.MenuModel({
					items: JSON.parse(script.textContent.trim())
				}))
			);
		},

		/**
		 * Make sure the selected item can be seen.
		 * @param {HTMLLiElement} checked
		 */
		_updatechecked: function(checked) {
			var panel = this.dom.parent(ts.ui.PanelSpirit);
			panel.css.shift(checked && isAppendix(checked), 'appendix');
			if (checked && !isInView(checked)) {
				goIntoView(checked);
			}
		},

		/**
		 * Select best item for path (in normal menu).
		 * @param {string} path
		 */
		_selectnormalitem: function(path) {
			path = folder(path);
			var that = this;
			function folder(full) {
				return full.replace(/[^\/]*$/, '');
			}
			function visible(item) {
				return !item.hidden;
			}
			(function closeall(items) {
				// reset previous run
				items.filter(visible).forEach(function(item) {
					item.open = false;
					if (item.items) {
						closeall(item.items);
					}
				});
			})(this._model.items);
			(function loop(items, container) {
				// do current run
				items.filter(visible).forEach(function(item) {
					if (item.path) {
						var match = folder(item.path) === path;
						var state = item.selected;
						if ((item.selected = match)) {
							if (match !== state) {
								that._newselection = true;
							}
							if (container) {
								container.open = true;
							} else if (item.items) {
								if (!item.open) {
									item.open = true;
								}
							}
						}
					}
					if (item.items) {
						loop(item.items, item);
					}
				});
			})(this._model.items);
		},

		/**
		 * Select best item for path (in search results).
		 * @param {string} path
		 */
		_selectsearchitem: function(path) {
			this._model.searchresults.forEach(function(result) {
				result.selected = result.href === path;
			});
		},

		/**
		 * First item in the menu is selected? We'll use
		 * this in CSS to hide the search bar dropshadow.
		 * @returns {boolean}
		 */
		_firstselected: function() {
			var items = this._model.items;
			if (this._model.searchresults) {
				return false; // (search results banner is not an item)
			} else {
				return (
					items.indexOf(
						items.find(function(item) {
							return item.selected;
						})
					) === 0
				);
			}
		}
	});
})(
	/**
	 * Element is visible?
	 * @param {Element} el
	 * @returns {boolean}
	 */
	function isInView(el) {
		var rect = el.getBoundingClientRect();
		return rect.top >= 0 && rect.bottom <= window.innerHeight;
	},
	/**
	 * NOTE: Firefox supports this animated, see http://mdn.io/scrollIntoView,
	 * however this kind of animation should not happen on initial page load.
	 * @param {Element} el
	 */
	function intoView(el) {
		el.scrollIntoView(false);
	},
	/**
	 * Is menu item in the Appendix section selected (checked)?
	 * @param {Element} checked
	 * @returns {boolean}
	 */
	function isAppendix(checked) {
		return gui.CSSPlugin.matches(checked, 'li.submenu:last-child .ts-checked');
	}
);
