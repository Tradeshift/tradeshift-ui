/**
 * Spirit of the user.
 * @extends {ts.ui.CardSpirit}
 * @using {ts.ui.CardSpirit} CardSpirit
 */
ts.ui.UserCardSpirit = (function(UserCard) {
	return ts.ui.CardSpirit.extend(
		{
			/**
			 * Show the user details in an aside.
			 */
			open: function() {
				var clone = ts.ui.UserCardModel.from(this._model);
				clone.type = 'ts-details';
				ts.ui
					.Aside({
						title: UserCard.localize('userDetails'),
						items: [clone],
						onclosed: function() {
							this.dispose();
						}
					})
					.open();
			}
		},
		{
			// Static ..............................................................

			/**
			 * Convert injected JSON to this kind of model.
			 * @see {ts.ui.ObjectSpirit}
			 * @type {constructor}
			 */
			model: ts.ui.UserCardModel,

			/**
			 * Fetch the model from this kind of collection.
			 * @see {ts.ui.ObjectSpirit}
			 * @type {constructor}
			 */
			collection: ts.ui.UserCardCollection
		}
	);
})(ts.ui.UserCard);
