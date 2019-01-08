/**
 * Note API.
 * @param {object|ts.ui.NoteModel} opt_json
 * @returns {*|edb.Type}
 * @constructor
 */
ts.ui.Note = function(opt_json) {
	if (ts.ui.Note._model) {
		console.warn('Note model already exists! There can be only one!');
		return ts.ui.Note._model;
	}
	ts.ui.Note._model = new ts.ui.NoteModel(opt_json);
	ts.ui.Note._model.addObserver(ts.ui.Note);
	ts.ui.Note._addSpirit();
	return ts.ui.Note._model;
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.Note.toString = function() {
	return '[funtion ts.ui.Note]';
};

// Implementation ..............................................................

(function using(api, chained, confirmed) {
	/**
	 * API methods.
	 */
	gui.Object.extend(ts.ui.Note, {
		/**
		 * Add or find the Spirit of the page-level Note
		 * @private
		 */
		_addSpirit: function getspirit() {
			if (document.querySelector('.ts-content ~ .ts-note')) {
				ts.ui.Note._model.$isTopNote = true;
			} else {
				var noteSpirit = ts.ui.NoteSpirit.summon(ts.ui.Note._model);
				ts.ui.Note._model.$isTopNote = true;
				noteSpirit.dom.insertBefore(document.querySelector('.ts-content'));
			}
		},

		/**
		 * Handle (model) changes.
		 */
		onchange: function() {}
	});
})();
