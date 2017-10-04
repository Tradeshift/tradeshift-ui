/**
 * Spirit of the box.
 * @extends {ts.ui.Spirit}
 */
ts.ui.PanelsSpirit = (function() {
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
		 * Call function on parent box if it exists.
		 * @param {Function} action
		 * @returns {*}
		 */
		_box: function(action) {
			var box = this.dom.parent(ts.ui.BoxSpirit);
			if (box) {
				return action.call(this, box);
			}
		}
	});
})();
