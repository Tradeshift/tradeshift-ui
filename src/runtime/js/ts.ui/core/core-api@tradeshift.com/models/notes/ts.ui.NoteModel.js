/**
 * Note model.
 * @extends {ts.ui.Model}
 * @using {ts.ui.Note} Note
 */
ts.ui.NoteModel = (function using() {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'note',

		/**
		 * This is really just a CSS classname.
		 * @type {string}
		 */
		type: '',

		/**
		 * Note icon.
		 * @type {string}
		 */
		icon: '',

		/**
		 * Primary text
		 * @type {string}
		 */
		text: '',

		/**
		 * When toggled `false`, the Note will be closed and disposed.
		 */
		open: true,

		/**
		 * Open for implementation: What to do when closing the Note.
		 * @type {Function}
		 */
		onclose: null,

		/**
		 * TODO: Implement callback for links clicked in the Note!!!
		 * Open for implementation: Callback for when a link is clicked.
		 * @type {Function}
		 */
		onlink: null,

		/**
		 * Close the note.
		 * @returns {ts.ui.NoteModel}
		 */
		close: function() {
			this.open = false;
			return this;
		},

		/**
		 * button in the note.
		 * @type {ts.ui.ButtonCollection<ts.ui.ButtonModel>}
		 */
		buttons: ts.ui.ButtonCollection,

		// Privileged ..............................................................

		/**
		 * Is it the note in the top?
		 * @type {boolean}
		 */
		$isTopNote: false
	});
})();
