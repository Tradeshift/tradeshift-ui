ts.ui.ButtonMenuModel = (function() {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'buttonsmenu',

		/**
		 * Buttons.
		 * @type {ts.ui.ButtonCollection<ts.ui.ButtonModel>}
		 */
		items: ts.ui.ButtonCollection,

		/**
		 * Bounce model to HTML.
		 * @return {string}
		 */
		render: function() {
			return ts.ui.buttonsmenu.edbml(this);
		}
	});
})();
