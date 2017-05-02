/**
 * Objects GUI module.
 */
gui.module('objects-gui@tradeshift.com', {
	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		['[data-ts=CompanyCard]', ts.ui.CompanyCardSpirit],
		['[data-ts=UserImage]', ts.ui.UserImageSpirit],
		['[data-ts=UserCard]', ts.ui.UserCardSpirit]
	]
});
