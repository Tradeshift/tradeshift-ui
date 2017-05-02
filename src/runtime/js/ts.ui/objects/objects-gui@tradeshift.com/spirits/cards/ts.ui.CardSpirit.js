/**
 * Spirit of the card.
 * @see {ts.ui.CompanyCardSpirit}
 * @see {ts.ui.UserCardSpirit}
 * @using {ts.ui.Card} card
 */
ts.ui.CardSpirit = (function(Card) {
	/*
	 * If these classes are not found,
	 * we'll add a default classname.
	 */
	var specialclasses = [Card.TYPE_COMPACT, Card.TYPE_INLINE, Card.TYPE_DETAILS];

	return ts.ui.ObjectSpirit.extend({
		/**
		 * Stub myself with a potential mock model so that we can
		 * show a default rendering before some real data arrives.
		 * TODO: Perhaps move up to {ts.ui.ObjectSpirit}?
		 */
		onconfigure: function() {
			var mock = this.constructor.MOCK_MODEL;
			if (mock && !this._model) {
				this._model = mock;
			}
			this.super.onconfigure();
		},

		/**
		 * Setup.
		 */
		onenter: function() {
			this.super.onenter();
			this._classnames(this.css);
		},

		// Private .................................................................

		/**
		 * Add default classnames (for nicer LESS management).
		 * @param {gui.CSSPlugin} css
		 */
		_classnames: function(css) {
			css.add('ts-card');
			if (
				!specialclasses.some(function(cname) {
					return css.contains(cname);
				})
			) {
				css.add(Card.TYPE_DEFAULT);
			}
		}
	});
})(ts.ui.Card);
