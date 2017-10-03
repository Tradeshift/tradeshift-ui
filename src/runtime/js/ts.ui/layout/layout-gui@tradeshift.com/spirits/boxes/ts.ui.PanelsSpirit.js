/**
 * Spirit of the box.
 * @extends {ts.ui.Spirit}
 * @using {Class<ts.ui.BoxSpirit>} BoxSpirit
 */
ts.ui.PanelsSpirit = (function(BoxSpirit) {
	return ts.ui.Spirit.extend({
		// Privileged ..............................................................

		/**
		 * Called by the {ts.ui.PanelsPlugin} to append a tab.
		 * @param {Object} json
		 * @param {number} index
		 */
		$insertTab: function(json, index) {
			this._box(function(box) {
				box.$insertTab(json, index);
			});
		},

		$selectTab: function() {
			console.log('TODO: $selectTab');
		},

		// Private .................................................................

		/**
		 * Call function on parent box.
		 * @param {Function} action
		 */
		_box: function(action) {
			var box = this.dom.parent(BoxSpirit);
			if (box) {
				action.call(this, box);
			}
		}
	});
})(ts.ui.BoxSpirit);
