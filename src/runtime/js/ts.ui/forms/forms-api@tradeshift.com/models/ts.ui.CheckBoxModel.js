/**
 * Advanced checkbox model.
 * @extends {ts.ui.Model}
 * @using {gui.Combo.chained}
 */
ts.ui.CheckBoxModel = (function using(chained) {
	return ts.ui.Model.extend({
		/**
		 * Most commonly used as a tooltip.
		 * @type {string}
		 */
		info: '',

		/**
		 * Checked?
		 * @type {boolean}
		 */
		checked: false,

		/**
		 * Indeterminate?
		 * @type {boolean}
		 */
		indeterminate: false,

		/**
		 * Visible?
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * Open for implementation: Called when clicked (not handled in the model!).
		 * @type {function}
		 */
		onclick: null,

		/**
		 * Check that checkbox.
		 * @returns {this}
		 */
		check: chained(function() {
			this.checked = true;
		}),

		/**
		 * Uncheck the checkbox.
		 * @returns {this}
		 */
		uncheck: chained(function() {
			this.checked = false;
		}),

		/**
		 * Hide the checkbox.
		 * @returns {this}
		 */
		hide: chained(function() {
			this.visible = false;
		}),

		/**
		 * Show the checkbox.
		 * @returns {this}
		 */
		show: chained(function() {
			this.visible = true;
		})
	});
})(gui.Combo.chained);
