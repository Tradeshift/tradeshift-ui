/**
 * Superclass for toolbars and topbars, who for
 * complicated reasons cannot extend each other.
 * @extends {ts.ui.Model}
 * @using {ts.ui.ButtonCollection} ButtonCollection
 */
ts.ui.BarModel = (function using(ButtonCollection) {
	return ts.ui.Model.extend({
		// Privileged ................................................................

		/**
		 * List buttons ascending: In they order they were added, but
		 * grouped into primary, sencondary and tertiary button types.
		 * @returns	 {Array<ts.ui.ButtonModel|ts.ui.ButtonCollection>}
		 */
		$allbuttons: function() {
			return this.buttons.ascending().filter(function(thing) {
				if (ButtonCollection.is(thing)) {
					return thing.every(function(button) {
						return button.visible;
					});
				} else {
					return thing.visible;
				}
			});
		},

		/**
		 * List visible actions (mostly for parity with `$allbuttons` above).
		 * @returns {Arrray<ts.ui.ActionModel>}
		 */
		$allactions: function() {
			return this.actions.filter(function(action) {
				return action.visible;
			});
		},

		/**
		 * Get primary and secondary buttons (ascending).
		 * @returns {Array<ts.ui.ButtonModel>}
		 */
		$specialbuttons: function() {
			return this._sortbuttons(this.$allbuttons(), true);
		},

		/**
		 * Get tertiary buttons (ascending).
		 * @returns {Array<ts.ui.ButtonModel>}
		 */
		$normalbuttons: function() {
			return this._sortbuttons(this.$allbuttons(), false);
		},

		// Private .................................................................

		/**
		 * Sort buttons for distribution into ASIDE.
		 * This methods gets invoked by the EDBML.
		 * @see ts.ui.TopBarSpirit.edbml
		 * @param {boolean} special
		 * @returns {Array<ts.ui.ButtonModel>}
		 */
		_sortbuttons: function(buttons, special) {
			return buttons.filter(function(thing) {
				var button = thing;
				if (ButtonCollection.is(thing)) {
					button = thing[0];
				}
				if (button.type.indexOf(ts.ui.CLASS_TERTIARY) > -1) {
					if (!special) {
						return true;
					}
				} else {
					return special;
				}
			});
		}
	});
})(ts.ui.ButtonCollection);
