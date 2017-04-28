/**
 * Advanced card model.
 * @see {ts.ui.CompanyCardModel}
 * @see {ts.ui.UserCardModel}
 */
ts.ui.CardModel = (function() {
	return ts.ui.ObjectModel.extend({
		/**
		 * When creating cards via JSON API, this will work like the rendered
		 * spirits classname. When creating cards in HTML, just use classname!
		 * @type {string}
		 */
		type: null
	});
})();
