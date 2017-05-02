/**
 * Advanced menu model.
 * @extends {ts.ui.Model}
 * @using {gui.Type} Type
 * @using {gui.Combo.chained} chained
 */
ts.ui.MenuModel = (function using(Type, chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'menu',

		/**
		 * Items list. Note that this is a just an array of "simple" objects,
		 * that's why the 'onselect' callback is on the menu and not the item.
		 * @type {Array}
		 */
		items: Array,

		/**
		 * Matches one|many.
		 * @type {string}
		 */
		select: 'one',

		/**
		 * Selected index (if selecting one).
		 * @type {number}
		 */
		selectedIndex: -1,

		/**
		 * Selected indexes (if selecting many).
		 * @type {edb.Array<number>}
		 */
		selectedIndexes: edb.Array,

		/**
		 * Experimental.
		 * @type {number}
		 */
		maxItemsShown: -1,

		/**
		 * TODO!
		 * @type {function}
		 */
		search: null,

		/**
		 * Stamp the search term onto a property because
		 * this will be synchronized xframe (greenfield).
		 * @type {string}
		 */
		searchterm: null,

		/**
		 * Terrible. Used to force a refresh of the (EDBML) view.
		 * TODO: Figuer something out, make a model.$dirty method
		 * @type {number}
		 */
		random: -1,

		/**
		 * Callback for item selected. Open for implementation.
		 * @type {function}
		 * @param {number} index This equals the new 'selectedIndex'.
		 */
		onselect: null,

		/**
		 * Label for Done-button (if selecting multiple).
		 * @type {string}
		 */
		donebuttonlabel: ts.ui.String.LABEL_ACCEPT,

		/**
		 * Only used for the Done button in multiple selects.
		 * If needed elsewhere, please rethink implementation.
		 * @see {ts.ui.SelectInputSpirit}
		 * @type {boolean}
		 */
		donebuttonenabled: false,

		/**
		 * Used for the Done button in multiple selects.
		 * @type {boolean}
		 */
		donebuttonpressed: false,

		/**
		 * Not shown, but we can assign one anyway
		 * (it might be used in Aside headers etc).
		 * @type {string}
		 */
		title: null,

		/**
		 * Observe myself and setup the search.
		 * TODO: fire `onidle` also on search cleared
		 * so that we don't need the method `onsearch`
		 */
		onconstruct: function() {
			this.super.onconstruct();
			var that = this;
			this.addObserver(this);
			if (this.select === 'many') {
				// this.selectedIndexes.addObserver(this);
			}
			this._searchmodel = new ts.ui.SearchModel({
				onsearch: function(value) {
					that.searchterm = value;
				},
				onidle: function(value) {
					that.searchterm = value;
				}
			});
		},

		/**
		 * TODO: Automate this.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.removeObserver(this);
		},

		/**
		 * Handle (potentially xframe synchronized) changes.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			changes.forEach(function(c) {
				switch (c.name) {
					case 'searchterm':
						this._search(c.newValue);
						break;
					case 'selectedIndex':
						if (this.onselect) {
							this.onselect(c.newValue);
						}
						break;
				}
			}, this);
		},

		/**
		 * Show all items (assuming hre that maxItemsShown was enforced).
		 * Again, we can only sync this xframe via simple property changes.
		 * @returns {ts.ui.MenuModel}
		 */
		showallitems: chained(function() {
			this.maxItemsShown = -1;
		}),

		/**
		 * Bounce model to HTML string.
		 * @return {string}
		 */
		render: function() {
			return ts.ui.menu.edbml(this);
		},

		/**
		 * Used for the Done button in multiple selects.
		 */
		done: function() {
			this.donebuttonpressed = true;
		},

		open: function() {
			ts.ui
				.Aside({
					title: 'Test',
					items: [this]
				})
				.open();
		},

		/**
		 * We have no idea where this MenuModel is being rendered, but when we're
		 * optimizing SELECT performance, we need the panel of the containing aside
		 * to scroll to some designated position. This method is called directly
		 * from within the EDBML function so that everything is synchronized to a
		 * single screen repaint (eg. not involving any async observer callbacks).
		 * @see {ts.ui.menu.edbml}
		 * @param {number} scrollTop
		 */
		scrollContainingPanel: function(scrollTop) {
			gui.Broadcast.dispatch(ts.ui.BROADCAST_PANEL_SYNC_MENU, {
				menuid: this.$instanceid,
				offset: scrollTop
			});
		},

		// Private .................................................................

		/**
		 * Probably not needed no more.
		 * @type {ts.ui.SearchModel}
		 */
		_searchmodel: null,

		/**
		 * Search will probably be moved into the Aside header,
		 * at which point this code can be deleted for good...
		 * @param {string} value
		 */
		_search: function(value) {
			if (Type.isFunction(this.search)) {
				this.items.forEach(function(item) {
					var bool = this.search(item, value);
					if (Type.isBoolean(bool)) {
						item.visible = bool;
					} else {
						throw new TypeError('Search expected a boolean');
					}
				}, this);
				this._forcerefresh();
			}
		},

		/**
		 * The items list is a simple Array (not a collection of models),
		 * so changes to the JSON will not retrigger the EDBML scripts.
		 * We have however hacked it so that EDBML scripts depend on an
		 * ad-hoc property called `random` which we'll now change...
		 */
		_forcerefresh: function() {
			this.random = Math.random();
		}
	});
})(gui.Type, gui.Combo.chained);
