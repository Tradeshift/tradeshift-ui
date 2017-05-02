/**
 * Spirit of the submenu item.
 * @using {ts.dox.ItemSpirit} ItemSpirit
 * @using {ts.dox.MenuCoverSpirit} ItemSpirit
 * @using {gui.Client} Client
 */
ts.dox.SubMenuSpirit = (function using(ItemSpirit, MenuCoverSpirit, Client) {
	return ItemSpirit.extend({
		/**
		 * Open or close the submenu (via markup attribute `data-ts.open`)
		 * @param {boolean} open
		 */
		open: function(open) {
			if (open !== this._open) {
				this.css.shift((this._open = open), 'open');
			}
		},

		// Private .................................................................

		/**
		 * Is open?
		 * @type {boolean}
		 */
		_open: false
	});
})(ts.dox.ItemSpirit, ts.dox.MenuCoverSpirit, gui.Client);
