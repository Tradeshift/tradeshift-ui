/**
 * Select API.
 * @param {number} json
 * @return {ts.ui.ProgressModel}
 */
ts.ui.Select = function(json) {
	return new ts.ui.SelectModel(json);
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.Select.toString = function() {
	return '[function ts.ui.Select]';
};
