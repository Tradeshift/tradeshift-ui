/**
 * Spirit of the Dox menu.
 * @using {function} isInView
 * @using {function} goIntoView
 */
ts.dox.MenuSpirit = (function using(isInView, goIntoView) {
	return ts.ui.Spirit.extend({

		/**
		 * Setup much.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.css.add('ts-menu');
			this.event.add('hashchange', window);
			this._loadmenu(this.dom.q('script'));
		},

		/**
		 * Make sure the selected item is visible.
		 * @param {TODOType} summary
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
			if (this._newselection) {
				this._revelchecked(this.dom.q('.ts-checked'));
				this._newselection = false;
			}
		},

		/**
		 * Select appropriate item by folder path (ignoring any file name).
		 * This gets called by the {ts.dox.DoxChromeSpirit} on hashchange.
		 * @param {string} path
		 */
		selectbestitem: function(path) {
			path = folder(path);
			var that = this;
			function folder(full) {
				return full.replace(/[^\/]*$/, ''); // eslint-disable-line no-useless-escape
			}
			(function loop(items, container) {
				items.filter(function(item) {
					return !item.hidden;
				}).forEach(function(item) {
					if (item.items) {
						loop(item.items, item);
					} else if (item.path) {
						var match = folder(item.path) === path;
						var state = item.selected;
						if ((item.selected = match)) {
							if (match !== state) {
								that._newselection = true;
							}
							if (container) {
								container.open = true;
							}
						}
					}
				});
			}(this._model.items));
		},

		// Private .................................................................

		/**
		 * @type {ts.dox.MenuModel}
		 */
		_model: null,

		/**
		 * Render menu from embedded JSON.
		 * @param {HTMLScriptElement} script
		 */
		_loadmenu: function(script) {
			this._model = new ts.dox.MenuModel({
				items: JSON.parse(script.textContent.trim())
			});
			this.script.load(ts.dox.MenuSpirit.edbml);
			this.script.input(this._model);
		},

		/**
		 * Make sure the selected item can be seen.
		 * @param {HTMLLiElement} checked
		 */
		_revelchecked: function(checked) {
			if (checked && !isInView(checked)) {
				goIntoView(checked);
			}
		}

	});
}(

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
	}
));
