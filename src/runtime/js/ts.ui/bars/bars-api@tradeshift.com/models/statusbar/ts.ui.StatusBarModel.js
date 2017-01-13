/**
 * Advanced statusbar model.
 * @extends {ts.ui.ToolBarModel}
 */
ts.ui.StatusBarModel = (function using(chained) {
	return ts.ui.ToolBarModel.extend({

		/**
		 * @type {ts.ui.PagerModel}
		 */
		pager: null,

		/**
		 * Status message may contain links?
		 * @type {boolean}
		 */
		linkable: false,

		/**
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.statusbar.edbml(this);
		},

		/**
		 * Handle model changes.
		 * @param {Array<edb.Change>} changes
		 * @returns {boolean} True when updated
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			changes.forEach(function(c) {
				if (c.name === 'pager') {
					this._updatehascontent();
				}
			}, this);
		},

		/**
		 * Account for the pager.
		 * @returns {boolean}
		 */
		_updatehascontent: function() {
			if (!this.super._updatehascontent()) {
				this.hascontent = !!this.pager;
			}
			return this.hascontent;
		}

	});
}());
