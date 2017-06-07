/**
 * Advanced icon model.
 */
ts.ui.IconModel = (function() {
	return ts.ui.Model.extend({
		/**
		 * The classname of the rendered `<i>` element.
		 * @type {string}
		 */
		type: null,

		/**
		 * Icon color.
		 * @type {string}
		 */
		color: 'dark',

		/**
		 * Used for sorting (in the Table).
		 * @type {string|number}
		 */
		value: null,

		/**
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.icononly.edbml(this);
		}
	});
})();
