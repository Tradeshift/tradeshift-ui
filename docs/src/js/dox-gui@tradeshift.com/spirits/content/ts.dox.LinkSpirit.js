/**
 * Spirit of the link that will load pages via
 * the chrome instead of directly in the iframe.
 */
ts.dox.LinkSpirit = (function() {
	return ts.ui.ButtonSpirit.extend({
		/**
		 * If in the iframe, change the link back to chrome-loading mode
		 * (as originally authored in the source XHTML file). Otherwise
		 * keep the no-chrome loading mode (as setup by `processor.js`).
		 */
		onconfigure: function() {
			this.super.onconfigure();
			var elem = this.element;
			var href = elem.getAttribute('href');
			if (gui.hosted && href && href.startsWith('/dist/')) {
				elem.href = href.replace('/dist/', '/#');
				this._chromelink = true;
			}
		},

		/**
		 * Don't navigate normally (if inside the iframe).
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e); // this calls method `_dispatchaction()` below...
			if (e.type === 'click' && this._chromelink) {
				e.preventDefault();
			}
		},

		// Private .................................................................

		/**
		 * Should open my link via the chrome?
		 * @type {boolean}
		 */
		_chromelink: false,

		/**
		 * @overloads {ts.ui.ButtonSpirit#_dispatchaction}
		 */
		_dispatchaction: function() {
			if (this._chromelink) {
				var action = ts.ui.ACTION_GLOBAL_LOAD;
				this.action.dispatchGlobal(
					action,
					this.data || {
						href: this.element.href,
						target: this.element.target
					}
				);
			} else {
				this.super._dispatchaction();
			}
		}
	});
})();
