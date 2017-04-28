/**
 * UserCard API.
 * @param {object|ts.ui.UserCardModel} json
 * @returns {ts.ui.UserCardModel}
 */
ts.ui.UserCard = function(json) {
	var model = ts.ui.UserCardModel.from(json);
	model.addObserver(ts.ui.UserCard);
	return model;
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.UserCard.toString = function() {
	return '[function ts.ui.UserCard]';
};

/**
 * Ad-hoc localization interface. Omit the
 * argument to get the current localization.
 * TODO: Greenfield this (add xframe support).
 * @param @optional {object|string} config
 * @returns {object}
 */
ts.ui.UserCard.localize = function(config) {};

// Implementation ..............................................................

/**
 * @using {ts.ui.Greenfield#api} api
 * @using {gui.Object#hidden} hidden
 * @using {gui.Combo#chained} chained
 */
(function UserCard(api, hidden, chained) {
	var locale = null;

	/**
	 * GUI extras.
	 */
	gui.Object.extend(ts.ui.UserCard, {
		/**
		 * Handle (model) changes.
		 * TODO(jmo@): move this handler out of {ts.ui.Dialog} methods
		 * @param {Array<gui.Change>} changes
		 */
		onchange: hidden(function(changes) {
			var that = this;
			changes.forEach(function(c) {
				var model = c.object;
				switch (c.name) {
					case 'isOpen':
						var clone = ts.ui.UserCardModel.from(model);
						clone.type = 'ts-details';
						ts.ui
							.Aside({
								title: that.localize('userDetails'),
								items: [clone],
								onclosed: function() {
									this.dispose();
								}
							})
							.open();
						break;
				}
			});
		}),

		/**
		 * TODO: This is copy-pasted from some other API, refactor for common
		 * inheritance chain (and supress "privacy" concerns for simpler code).
		 */
		localize: api(
			chained(function(arg) {
				if (arguments.length) {
					switch (gui.Type.of(arg)) {
						case 'object':
							var newlocale = arg;
							if (
								!locale ||
								Object.keys(locale).every(function(key) {
									var has = newlocale.hasOwnProperty(key);
									if (!has) {
										console.error('Missing translations for ' + key);
									}
									return has;
								})
							) {
								locale = newlocale;
							}
							break;
						case 'string':
							var key = arg;
							if (locale && locale.hasOwnProperty(key)) {
								return locale[key];
							} else {
								console.error('Missing translations for ' + key);
							}
							break;
					}
				} else {
					return locale;
				}
			})
		)
	});
})(ts.ui.Greenfield.api, gui.Object.hidden, gui.Combo.chained);

/**
 * Default-localize the UserCard.
 */
ts.ui.UserCard.localize({
	currentUserDisplayName: 'You',
	userDetails: 'User Details'
});
