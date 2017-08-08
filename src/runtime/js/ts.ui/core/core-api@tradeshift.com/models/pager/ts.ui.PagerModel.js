/**
 * Advanced pager model.
 * @using {gui.Combo#chained}
 */
ts.ui.PagerModel = (function using(chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'pager',

		/**
		 * Total pages.
		 * @type {number}
		 */
		pages: -1,

		/**
		 * Current page (zero-based).
		 * TODO: rename `index`!!!!!!
		 * @type {number}
		 */
		page: 0,

		/**
		 * Max amount of buttons to show.
		 * @type {number}
		 */
		max: 5,

		/**
		 * Index of first button to show.
		 * @type {number}
		 */
		init: 0,

		/**
		 * For when used in a flexible scenario (toolbars).
		 * @type {number}
		 */
		flex: 1,

		/**
		 * Pager should be visible (in the rendering)?
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * Open for implementation. Called when the `page` property changes.
		 * @param {number} index
		 * @type {function}
		 */
		onselect: null,

		/**
		 * Observe myself.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.addObserver(this);
		},

		/**
		 * Unobserve myself.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.removeObserver(this);
		},

		/**
		 * Goto first.
		 */
		first: function() {
			this.page = 0;
			this.init = 0;
		},

		/**
		 * Goto last.
		 */
		last: function() {
			this.page = this.pages - 1;
			this.init = this.pages - this.max;
		},

		/**
		 * Goto next.
		 */
		next: function() {
			this.page++;
			this._initup();
		},

		/**
		 * Goto previous.
		 */
		prev: function() {
			this.page--;
			this._initdown();
		},

		/**
		 * Handle changes (to myself).
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			if (this.onselect) {
				changes.forEach(function(c) {
					if (c.name === 'page') {
						this.onselect(c.newValue);
						if (c.newValue > c.oldValue) {
							this._initup();
						} else {
							this._initdown();
						}
					}
				}, this);
			}
		},

		/**
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.pager.edbml(this);
		},

		/**
		 * Hide the Pager.
		 * @returns {this}
		 */
		hide: chained(function() {
			this.visible = false;
		}),

		/**
		 * Show the Pager.
		 * @returns {this}
		 */
		show: chained(function() {
			this.visible = true;
		}),

		// Private .................................................................

		_initup: function() {
			var max = this.max;
			var page = this.page;
			var pages = this.pages;
			while (page >= this.init + max && this.init <= pages - max) {
				this.init++;
			}
		},

		_initdown: function() {
			var page = this.page;
			while (page < this.init && this.init > 0) {
				this.init--;
			}
		}
	});
})(gui.Combo.chained);
