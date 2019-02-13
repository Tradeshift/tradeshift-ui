/**
 * Advanced item model.
 * @extends {ts.ui.Model}
 * @param {function} chained
 */
ts.ui.ItemModel = (function using(chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'item',

		/**
		 * Item label.
		 * @type {string}
		 */
		label: null,

		/**
		 * Item icon.
		 * @type {string}
		 */
		icon: null,

		/**
		 * Is clicked? This will IMMEDIATELY RESET to false but we need a
		 * model property to synchronize the click across window contexts.
		 * @type {boolean}
		 */
		clicked: false,

		/**
		 * Is selected?
		 * @type {boolean}
		 */
		selected: false,

		/**
		 * Method stub.
		 * @type {function}
		 */
		onselect: null,

		/**
		 * TODO (jmo@): clarify the need to observe myself...
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.addObserver(this);
		},

		/**
		 * TODO (jmo@): Destruct is not really implemented (memory implications)
		 */
		ondestruct: function() {
			this.removeObserver(this);
			this.super.ondestruct();
		},

		/**
		 * Handle changes.
		 * @param {Array<gui.Change>} changes
		 */
		onchange: function(changes) {
			if (this.onselect) {
				changes.forEach(function(c) {
					if (c.name === 'clicked' && c.newValue) {
						this.clicked = false;
						if (!this.selected) {
							gui.Tick.time(
								function unfreeze() {
									this.onselect();
								}.bind(this)
							);
						} else {
							/**
							 * @TODO: implement onunselect?
							 */
						}
					}
				}, this);
			}
		},

		/**
		 * Select item. Note that this only "checks" the item if the
		 * containing {ts.ui.MenuModel} has the `select` property set.
		 * @return {ts.ui.ItemModel}
		 */
		select: chained(function() {
			this.clicked = true;
		}),

		/**
		 * Unselect item. Does nothing unless the containing
		 * {ts.ui.MenuModel} has the `select` property set.
		 * @return {ts.ui.ItemModel}
		 */
		unselect: chained(function() {
			this.clicked = true;
		}),

		/**
		 * Bounce model to HTML.
		 * @return {string}
		 */
		render: function() {
			return ts.ui.item.edbml(this);
		}
	});
})(gui.Combo.chained);
