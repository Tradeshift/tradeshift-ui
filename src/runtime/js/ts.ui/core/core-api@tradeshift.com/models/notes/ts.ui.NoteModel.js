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
		 * What to do when closing the Note.
		 * @type {function|null}
		 */
		onclose: null,

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
}());
