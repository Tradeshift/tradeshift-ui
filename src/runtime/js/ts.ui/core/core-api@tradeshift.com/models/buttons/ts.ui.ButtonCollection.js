/**
 * Advanced collection of buttons.
 * @extends {ts.ui.Collection}
 * @using {gui.Arguments.confirmed} confirmed
 * @using {gui.Combo.chained} chained
 */
ts.ui.ButtonCollection = (function using(confirmed, chained) {
	return ts.ui.Collection.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'buttons',

		/**
		 * All buttons (manually made) visible?
		 * TODO: This prop should be observed!
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * All buttons (manually) disabled?
		 * TODO: This prop should be observed!
		 * @type {boolean}
		 */
		disabled: false,

		/**
		 * Content model constructor.
		 * @returns {constructor}
		 */
		$of: confirmed('(object|array)')(function(arg) {
			if (ts.ui.ButtonModel.is(arg) || ts.ui.ButtonCollection.is(arg)) {
				return arg;
			}
			if (Array.isArray(arg)) {
				return ts.ui.ButtonCollection;
			} else {
				return ts.ui.ButtonModel;
			}
		}),

		/**
		 * Sort primary buttons last (rightmost in toolbar)
		 * and run action for each element in sorted result.
		 * Does not modify the structure of this collection.
		 * @param @optional {function} action
		 * @param @optional {object} opt_thisp
		 * @return {Array<object>} Collect action results.
		 */
		ascending: function(action, opt_thisp) {
			return this._eachOrdered(
				true,
				action ||
					function(button) {
						return button;
					},
				opt_thisp
			);
		},

		/**
		 * Run action with buttons first (leftmost in toolbar).
		 * @param @optional {function} action
		 * @param @optional {object} opt_thisp
		 * @return {Array<object>} Collect action results.
		 */
		descending: function(action, opt_thisp) {
			return this._eachOrdered(
				false,
				action ||
					function(button) {
						return button;
					},
				opt_thisp
			);
		},

		/**
		 * Bounce collection to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.buttons.edbml(this);
		},

		/**
		 * Hide all buttons.
		 * @returns {ts.ui.ButtonCollection}
		 */
		hide: chained(function() {
			this.visible = false;
			this.forEach(function(button) {
				button.hide();
			});
		}),

		/**
		 * Show all buttons.
		 * @returns {ts.ui.ButtonCollection}
		 */
		show: chained(function() {
			this.visible = true;
			this.forEach(function(button) {
				button.show();
			});
		}),

		/**
		 * Disable all buttons.
		 * @returns {ts.ui.ButtonCollection}
		 */
		disable: chained(function() {
			this.disabled = true;
			this.forEach(function(button) {
				button.disable();
			});
		}),

		/**
		 * Enable all buttons.
		 * @returns {ts.ui.ButtonCollection}
		 */
		enable: chained(function() {
			this.disabled = false;
			this.forEach(function(button) {
				button.enable();
			});
		}),

		// Private .....................................................

		/**
		 * @param {boolean} ascending
		 * @param {function} action
		 * @param {Object=} opt_thisp
		 */
		_eachOrdered: function(ascending, action, opt_thisp) {
			return this._orderedBy(ascending).map(function(button, i) {
				return action.call(opt_thisp, button, i);
			});
		},

		/**
		 * Group the buttons according to priority.
		 * @param {boolean=} opt_ascending
		 */
		_orderedBy: function(opt_ascending) {
			var result = [].concat(
				this._filterBy(ts.ui.CLASS_DANGER),
				this._filterBy(ts.ui.CLASS_PRIMARY),
				this._filterBy(ts.ui.CLASS_SECONDARY),
				this._filterBy(ts.ui.CLASS_TERTIARY)
			);
			return opt_ascending ? result.reverse() : result;
		},

		/**
		 * List buttons of specific priority.
		 * @param {String} klass
		 */
		_filterBy: function(klass) {
			return this.filter(function(member) {
				switch (member.constructor) {
					case ts.ui.ButtonModel:
						return member.type.includes(klass);
					case ts.ui.ButtonCollection:
						return member.length && member[0].type.includes(klass);
				}
			});
		}
	});
})(gui.Arguments.confirmed, gui.Combo.chained);
