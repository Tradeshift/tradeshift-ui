/**
 * Objects GUI module.
 */
gui.module('objects-gui@tradeshift.com', {

	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		
		// OLD
		['[ts-companycard]', ts.ui.CompanyCardSpirit],
		['[ts-userimage]', ts.ui.UserImageSpirit],
		['[ts-usercard]', ts.ui.UserCardSpirit],
		
		// NEW
		['[data-ts=CompanyCard]', ts.ui.CompanyCardSpirit],
		['[data-ts=UserImage]', ts.ui.UserImageSpirit],
		['[data-ts=UserCard]', ts.ui.UserCardSpirit]
	]

});
