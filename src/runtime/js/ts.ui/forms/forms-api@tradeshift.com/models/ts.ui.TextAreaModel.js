/**
 * Advanced textarea model.
 * @extends {ts.ui.InputModel}
 */
ts.ui.TextAreaModel = (function() {
	return ts.ui.InputModel.extend({
		/**
		 * Friendly name.
		 */
		item: 'textarea',

		/**
		 * When false, ENTER will make the textarea grow (to a certain limit).
		 * When true, only SHIFT+ENTER will do that (chat comment style) and
		 * the ENTER key can be freed up to other purposes (eg. submit comment).
		 * @type {boolean}
		 */
		entershift: false,

		/**
		 * Rows default to three.
		 * @type {number}
		 */
		rows: 3
	});
})();
