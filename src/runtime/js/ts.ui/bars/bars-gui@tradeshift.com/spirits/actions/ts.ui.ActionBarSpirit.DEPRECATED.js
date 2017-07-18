/**
 * Spirit of the action bar.
 * @using {gui.Combo#chained} chained
 */
ts.ui.ActionBarSpirit = (function using(chained) {
	return ts.ui.ToolBarSpirit.extend({
		/**
		 * Add some classname.
		 */
		onenter: function() {
			this.super.onenter();
			this.css.add('.ts-toolbar ts-micro');
		},
		/**
		 * Get or set the actions.
		 * @param @optional {Array<object>} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		actions: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				model.actions = json;
			} else {
				return model.actions();
			}
		})
	});
})(gui.Combo.chained);
