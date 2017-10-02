/**
 * Spirit of the statusbar.
 * TODO: Move all this to (super) ToolBarSpirit and deprecate this thing.
 * NOTE: USED IN V4 ON https://github.com/Tradeshift/Apps/blob/master/src/main/v4apps/taskmanager/TaskManager/src/components/organisms/FooterToolbar/index.js
 * @using {ts.ui.PagerModel} PagerModel
 * @using {gui.Type} Type
 * @using {gui.Combo.chained} chained
 * @using {gui.Arguments.confirmed} confirmed
 */
ts.ui.StatusBarSpirit = (function using(PagerModel, Type, chained, confirmed) {
	return ts.ui.ToolBarSpirit.extend({
		/**
		 * Open for implementation: Called when message link is clicked.
		 * @type {function}
		 */
		onlink: null,

		/**
		 * Open for implementation: Called when the layout mode shifts (vertically).
		 * @type {function}
		 */
		onlayout: null,

		/**
		 * Set the message.
		 * @alias {ts.ui.StatusBarSpirit#title}
		 * @param @optional {string} text
		 */
		message: confirmed('(string)')(function(text) {
			return this.title.apply(this, arguments);
		}),

		/**
		 * @param {Object|null} [json]
		 * @returns {this|ts.ui.Model}
		 */
		checkbox: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				model.checkbox = json;
			} else {
				return model.checkbox;
			}
		}),

		/**
		 * Get or set the pager. Pass `null` to remove the pager (via bad API :/)
		 * @param @optional {object|ts.ui.PagerModel|null} opt_json
		 * @returns {ts.ui.PagerModel|this}
		 */
		pager: confirmed('(object|null)')(
			chained(function(opt_json) {
				var model = this.model();
				if (arguments.length) {
					if (model.pager) {
						model.pager.dispose();
					}
					if (opt_json === null) {
						model.pager = null;
					} else {
						model.pager = PagerModel.from(opt_json);
					}
				} else {
					if (!model.pager) {
						this.pager({});
					}
					return model.pager;
				}
			})
		),

		/**
		 * To support tabs, we would at least need to revisit the CSS.
		 * @overwrites {ts.ui.ToolBar#title}
		 */
		tabs: function() {
			throw new Error("The StatusBar doesn't support tabs :(");
		},

		/**
		 * TODO: Can this be privatized?
		 * Get or set the model. Not recommended.
		 * @param {object|ts.ui.StatusBarModel} model
		 * @returns {ts.ui.StatusBarModel|ts.ui.StatusBarSpirit}
		 */
		model: ts.ui.Spirit.createModelMethod(
			ts.ui.StatusBarModel,
			'ts.ui.ToolBarSpirit.edbml',
			function observe(model) {
				model.addObserver(this);
			}
		)
	});
})(ts.ui.PagerModel, gui.Type, gui.Combo.chained, gui.Arguments.confirmed);
