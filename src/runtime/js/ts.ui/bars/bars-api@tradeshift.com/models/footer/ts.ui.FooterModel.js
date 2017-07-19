/**
 * Advanced footer model.
 * @extends {ts.ui.Model}
 * @using {Class<PagerModel>} PagerModel
 */
ts.ui.FooterModel = (function using(PagerModel) {
	return ts.ui.Model.extend({
		/**
		 * @type {ts.ui.ToolBarModel}
		 */
		bufferbar: ts.ui.ToolBarModel,

		/**
		 * @type {ts.ui.ToolBarModel}
		 */
		actionbar: ts.ui.ToolBarModel,

		/**
		 * @type {ts.ui.ToolBarModel}
		 */
		centerbar: ts.ui.StatusBarModel,

		/**
		 * @type {ts.ui.ToolBarModel}
		 */
		backupbar: ts.ui.ToolBarModel,

		// Getters and setters .....................................................

		/**
		 * @type {ts.ui.CheckBoxModel}
		 */
		checkbox: {
			getter: function() {
				return this.actionbar.checkbox;
			},
			setter: function(json) {
				this.actionbar.checkbox = json;
			}
		},

		/**
		 * TODO: `title` and `status` should be split into two at some point :/
		 * @type {string}
		 */
		title: {
			getter: function() {
				return this.actionbar.title;
			},
			setter: function(string) {
				this.actionbar.title = string;
			}
		},

		/**
		 * @type {ts.ui.ButtonCollection}
		 */
		actions: {
			getter: function() {
				return this.actionbar.actions;
			},
			setter: function(json) {
				this.actionbar.actions = json;
			}
		},

		/**
		 * The {ts.ui.FooterBarSpirit} will move the buttons somewhere else!
		 * @type {ts.ui.ButtonCollection}
		 */
		buttons: {
			getter: function() {
				return this.bufferbar.buttons;
			},
			setter: function(json) {
				this.bufferbar.buttons = json;
			}
		},

		/**
		 * @type {ts.ui.PagerModel}
		 */
		pager: {
			getter: function() {
				return this.centerbar.pager;
			},
			setter: function(json) {
				this.centerbar.pager = json;
			}
		},

		// Methods .................................................................

		/**
		 * Initialize models.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.bufferbar = {};
			this.actionbar = {};
			this.centerbar = {};
			this.backupbar = {};
		},

		/**
		 * Bounce model to HTML.
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.footer.edbml(this);
		}
	});
})(ts.ui.PagerModel);
