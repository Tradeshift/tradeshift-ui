/**
 * Advanced collection of actions (some kind of alternative buttons).
 * @extends {ts.ui.ButtonCollection}
 * @using {gui.Arguments.confirmed} confirmed
 */
ts.ui.ActionCollection = (function using(confirmed) {
	return ts.ui.ButtonCollection.extend({
		/**
		 * Content model constructor.
		 * @returns {Class<ActionModel>}
		 */
		$of: confirmed('(object|array)')(function(arg) {
			return ts.ui.ActionModel;
		})
	});
})(gui.Arguments.confirmed);
