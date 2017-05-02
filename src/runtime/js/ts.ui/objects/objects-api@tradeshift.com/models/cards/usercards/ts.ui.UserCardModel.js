/**
 * Advanced usercard model.
 * @extends {ts.ui.CardModel}
 * @using {ts.ui.Card}
 * @using {ts.ui.CardModel}
 */
ts.ui.UserCardModel = (function using(Card, CardModel) {
	return CardModel.extend({
		/**
		 * the type of the user component.
		 * the value of the type: ts-default, ts-inline, ts-details
		 * TODO: This is "presentation data", should be deprecated!
		 * @type {string}
		 */
		type: ts.ui.Card.TYPE_DEFAULT,

		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'user',

		/**
		 * {
		 *	title: null,
		 *	role: null,
		 *	company: null,
		 *	companyUrl: null,
		 *	image: null,
		 *	name: null,
		 *	email: null,
		 * }
		 */
		data: Object,

		/**
		 * Card is detailed in Aside?
		 * @type {boolean}
		 */
		isOpen: false,

		/**
		 * Show details in Aside.
		 * @returns {ts.ui.CardModel}
		 */
		open: function() {
			this.isOpen = true;
			return this;
		},

		// Private .................................................................

		/**
		 * Get EDBML function for this card.
		 * @returns {function}
		 */
		_edbml: function() {
			return ts.ui.usercard.edbml;
		}
	});
})(ts.ui.Card, ts.ui.CardModel);
