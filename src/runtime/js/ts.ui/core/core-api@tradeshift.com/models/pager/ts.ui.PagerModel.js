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
		 * The number of items of a page.
		 * @type {number}
		 */
		number: 0,

		/**
		 * The total number of items.
		 * @type {number}
		 */
		total: 0,

		/**
		 * The status message of the pager.
		 * @type {String}
		 */
		status: '',

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
		 * Too late now, but next time: `onselect` should fire on newup (if defined)
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._initup();
			this._initstatus();
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
		 * TODO: Too late now, but next time throw RangeError if `page > pages - 1`
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			changes.forEach(function(c) {
				if (c.name === 'page') {
					var page = c.newValue;
					var most = this.max || this.defaultmax;
					var init = this.init;
					var last = init + most;
					if (page < this.pages) {
						if (page >= last) {
							this._initup();
						} else if (page < init) {
							this._initdown();
						}
					}
					if (this.onselect) {
						this.onselect(c.newValue);
					}
					this._initstatus();
				}
			}, this);
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

		/**
		 * Increment `this.init`.
		 */
		_initup: function() {
			var max = this.max;
			var page = this.page;
			var pages = this.pages;
			while (page >= this.init + max && this.init <= pages - max) {
				this.init++;
			}
		},

		/**
		 * Decrement `this.init`.
		 */
		_initdown: function() {
			var page = this.page;
			while (page < this.init && this.init > 0) {
				this.init--;
			}
		},

		/**
		 * sete page status
		 */
		_initstatus: function() {
			var page = this.page;
			var total = this.total;
			var number = Math.min(this.number, total);
			var start = page * number + 1;
			var end = Math.min((page + 1) * number, total);
			this.status = number > 0 && total > 0 ? start + ' - ' + end + ' (' + total + ')' : '';
		}
	});
})(gui.Combo.chained);
