/**
 * Superb collection of tags.
 * @extends {ts.ui.Collection}
 * @using {gui.Arguments.confirmed} confirmed
 */
ts.ui.TagCollection = (function using(confirmed) {
	return ts.ui.Collection.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'tags',

		/**
		 * Content model constructor.
		 * @returns {constructor}
		 */
		$of: confirmed('(object|array)')(function(arg) {
			if (ts.ui.TagModel.is(arg) || ts.ui.TagCollection.is(arg)) {
				return arg;
			}
			if (Array.isArray(arg)) {
				return ts.ui.TagCollection;
			} else {
				return ts.ui.TagModel;
			}
		}),

		/**
		 * Bounce collection to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.tags.edbml(this);
		}
	});
})(gui.Arguments.confirmed);
