/**
 * Advanced datepicker model.
 * @extends {ts.ui.Model}
 * @using {gui.Combo#chained}
 */
ts.ui.DatePickerModel = (function using(chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'date',

		/**
		 * DatePickers are often associated to an aside,
		 * in which case this becomes the aside header.
		 * @type {string}
		 */
		title: null,

		/**
		 * DatePicker Note.
		 * @type {String}
		 */
		note: '',

		/**
		 * Can be deselected
		 */
		deselectable: false,

		/**
		 * Picker is open?
		 */
		isOpen: false,

		/**
		 * @type {string}
		 */
		value: null,

		/**
		 * @type {string}
		 */
		min: null,

		/**
		 * @type {string}
		 */
		max: null,

		/**
		 * Called when selection changes.
		 * @type {function}
		 */
		onselect: null,

		/**
		 * Called when the associated ASIDE is fully closed.
		 * @type {function}
		 */
		onclosed: null,

		/**
		 * Observe myself (because of xframe synchronization).
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.addObserver(this);
		},

		/**
		 * Unobserve myself.
		 * TODO (jmo@): automate this step!
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.removeObserver(this);
		},

		/**
		 * Mark as open.
		 * @returns {ts.ui.DatePickerModel}
		 */
		open: chained(function() {
			this.isOpen = true;
		}),

		/**
		 * Mark as closed.
		 * @return {ts.ui.DatePickerModel}
		 */
		close: chained(function() {
			this.isOpen = false;
		}),

		/**
		 * Handle changes.
		 * @param {Array<gui.Change>} changes
		 */
		onchange: function(changes) {
			if (this.onselect) {
				changes.forEach(function(c) {
					if (c.name === 'value') {
						setTimeout(
							function unfreeze() {
								this.onselect(c.newValue, c.oldValue);
							}.bind(this)
						);
					}
				}, this);
			}
		},

		/**
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.datepicker.edbml(this);
		}
	});
})(gui.Combo.chained);
