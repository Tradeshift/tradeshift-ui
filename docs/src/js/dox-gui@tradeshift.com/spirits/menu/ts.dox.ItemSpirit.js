/**
 * Spirit of the menu item.
 */
ts.dox.ItemSpirit = (function using() {
	return ts.ui.Spirit.extend({
		/**
		 * Assign delta, prepare for tween.
		 * @param {number} delta
		 */
		delta: function(delta) {
			this.tween.add('doxmenu');
			this._delta = delta;
		},

		/**
		 * Handle tween.
		 * @param {gui.Tween} t
		 */
		ontween: function(t) {
			this.super.ontween(t);
			if (t.type === 'doxmenu') {
				if (t.done) {
					this.tween.remove('doxmenu');
					this.sprite.reset();
					this._delta = 0;
				} else {
					if (this._delta > 0) {
						this.sprite.y = this._delta * t.value;
					} else {
						this.sprite.y = Math.abs(this._delta) * (1 - t.value);
					}
				}
			}
		},

		// Private .................................................................

		/**
		 * Target delta.
		 * @type {number}
		 */
		_delta: 0
	});
})();
