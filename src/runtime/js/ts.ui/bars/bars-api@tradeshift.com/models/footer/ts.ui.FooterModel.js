/**
 * Advanced footer model.
 * @extends {ts.ui.Model}
 */
ts.ui.FooterModel = (function() {
	return ts.ui.Model.extend({
		/**
		 *
		 */
		bufferbar: ts.ui.ToolBarModel,

		/**
		 *
		 */
		actionbar: ts.ui.ToolBarModel,

		/**
		 *
		 */
		centerbar: ts.ui.StatusBarModel,

		/**
		 *
		 */
		backupbar: ts.ui.ToolBarModel,

		/**
		 *
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.bufferbar = {};
			this.actionbar = {};
			this.centerbar = {};
			this.backupbar = {};
		},

		/**
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.footer.edbml(this);
		}
	});
})();
