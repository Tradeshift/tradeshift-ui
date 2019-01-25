/**
 * Spirit of the main section.
 * @extends {ts.ui.PanelSpirit}
 */
ts.ui.MainSpirit = (function using(chained) {
	/**
	 * Backwards compatability.
	 * TODO: Delete this later!
	 * @param {Function} action
	 * @param {string} method
	 * @returns {ts.ui.AppSpirit}
	 */
	function forward(action, method) {
		console.error('"' + method + '" is deprecated on Main. Please move up to App.');
		return ts.ui.AppSpirit.$spirit(action);
	}

	return ts.ui.PanelSpirit.extend({
		/**
		 * @deprecated
		 */
		busy: chained(function() {
			var args = arguments;
			forward(function(app) {
				app.busy.apply(app, args);
			}, 'busy');
		}),

		/**
		 * @deprecated
		 */
		done: chained(function() {
			var args = arguments;
			forward(function(app) {
				app.done.apply(app, args);
			}, 'done');
		}),

		/**
		 * @deprecated
		 */
		blocking: chained(function() {
			var args = arguments;
			forward(function(app) {
				app.blocking.apply(app, args);
			}, 'blocking');
		}),

		/**
		 * Main is deprecated in Modal.
		 */
		onenter: function() {
			this.super.onenter();
			if (this.dom.parent().classList.contains('ts-panel')) {
				if (this.dom.ancestor(ts.ui.ModalSpirit)) {
					console.error('The Main in Modal is deprecated. Please replace it with a Box.');
				}
			}
		}
	});
})(gui.Combo.chained);
