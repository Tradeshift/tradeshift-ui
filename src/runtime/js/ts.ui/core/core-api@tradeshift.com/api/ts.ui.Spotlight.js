/**
 * Buttons API.
 * @param {object|ts.ui.MenuModel} json
 * @return {ts.ui.MenuModel}
 */
ts.ui.Spotlight = function(json) {
	return ts.ui.SpotlightModel.from(json);
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.Spotlight.toString = function() {
	return '[function ts.ui.Spotlight]';
};
