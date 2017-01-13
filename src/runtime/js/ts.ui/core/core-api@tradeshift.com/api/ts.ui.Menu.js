/**
 * Menu API.
 * @param {object|ts.ui.MenuModel} json
 * @return {ts.ui.MenuModel}
 */
ts.ui.Menu = function(json) {
	return ts.ui.MenuModel.from(json);
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.Menu.toString = function() {
	return '[function ts.ui.Menu]';
};
