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
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.icononly.edbml(this);
		}
	});
})();
