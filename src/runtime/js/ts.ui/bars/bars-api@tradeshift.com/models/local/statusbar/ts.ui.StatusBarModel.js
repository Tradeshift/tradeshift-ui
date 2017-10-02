/**
 * Advanced statusbar model.
 * TODO: Move all this to (super) ToolBarModel and deprecate this thing.
 * @extends {ts.ui.ToolBarModel}
 */
ts.ui.StatusBarModel = (function using(chained) {
	return ts.ui.ToolBarModel.extend({
		/**
		 * It's a long story and it involves a bug in the specification of EDBML. 
		 * If we don't migrate to Spiritual 2.0 soon, I promise to tell the story.
		 * @type {ts.ui.PagerModel}
		 */
		pager: {
			getter: function() {
				return this.actualpager;
			},
			setter: function(json) {
				if (json !== null && !ts.ui.PagerModel.is(json)) {
					json = ts.ui.PagerModel.from(json);
				}
				this.actualpager = json;
			}
		},

		/**
		 * This cannot be private (or the EDBML will not pick changes up).
		 * @type {ts.ui.PagerModel}
		 */
		actualpager: null,

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

		// Private .................................................................

		/**
		 * Account for the pager.
		 * @returns {boolean}
		 */
		_updatehascontent: function() {
			if (!this.super._updatehascontent()) {
				this.hascontent = !!this.actualpager;
			}
			return this.hascontent;
		}
	});
})();
