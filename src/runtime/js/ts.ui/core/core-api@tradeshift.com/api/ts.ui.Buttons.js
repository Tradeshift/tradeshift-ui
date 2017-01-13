/**
 * Buttons API.
 * @param {object|ts.ui.MenuModel} json
 * @return {ts.ui.MenuModel}
 */
ts.ui.Buttons = function(json) {
	return ts.ui.ButtonMenuModel.from(json);
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.Buttons.toString = function() {
	return '[function ts.ui.Buttons]';
};
