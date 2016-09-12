/**
 * @param {object|ts.ui.FormModel} json
 * @return {ts.ui.FormModel}
 */
ts.ui.Form = function(json) {
	return ts.ui.FormModel.from(json);
};
