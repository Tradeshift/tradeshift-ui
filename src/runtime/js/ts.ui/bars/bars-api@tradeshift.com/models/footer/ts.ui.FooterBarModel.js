/**
 * Advanced footer model.
 * @extends {ts.ui.Model}
 * @using {Class<PagerModel>} PagerModel
 * @using {Class<ts.ui.ActionModel>} ActionModel
 * @using {gui.Combo#chained} chained
 */
ts.ui.FooterBarModel = (function using(PagerModel, ActionModel, chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'footerbar',

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
		 * @type {string}
		 */
		status: {
			getter: function() {
				return this.actionbar.status;
			},
			setter: function(string) {
				this.actionbar.status = string;
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
		 * Buttons will be rendered at first into the bufferbar for measurements.
		 * The {ts.ui.FooterBarSpirit} will then move the buttons somewhere else.
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

		/**
		 * Note: Also injected into bufferbar so that it can affect measurements.
		 * Perhaps the right approach is to only render it in the bufferbar and 
		 * then move it to `center` or `backup` just like we do with the buttons?
		 * @type {ts.ui.ButtonModel}
		 */
		configbutton: {
			getter: function() {
				return this.bufferbar.configbutton;
			},
			setter: function(json) {
				this.bufferbar.configbutton = json;
				this.centerbar.configbutton = json;
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
		},

		/**
		 * Show the collaboration button (which is really just a centerbar action).
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		showCollaboration: chained(function(onclick) {
			this.bufferbar.actions = [
				{
					label: 'Collaborate On This',
					icon: 'ts-icon-collaboration',
					onclick: onclick
				}
			];
		}),

		/**
		 * Show the dedicated collaboration button.
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		hideCollaboration: chained(function() {
			this.bufferbar.actions.clear();
		}),

		// Privileged ..............................................................

		/**
		 * Show any bars at all (although this method is not really used anywhere)?
		 * @returns {boolean}
		 */
		$show: function() {
			return (
				this.$showActionBar(this.actionbar) ||
				this.$showCenterBar(this.centerbar) ||
				this.$showBackupBar(this.backupbar)
			);
		},

		/**
		 * Should show the action bar? Called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showActionBar: function(model) {
			return !!(model.actions.getLength() || model.status || model.checkbox);
		},

		/**
		 * Should show the center bar? Called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showCenterBar: function(model) {
			return !!(
				model.pager ||
				model.configbutton ||
				model.actions.getLength() ||
				model.buttons.getLength()
			);
		},

		/**
		 * Should show the backup bar? Called from EDBML.
		 * @param {ts.ui.ToolBarModel} model
		 * @returns {boolean}
		 */
		$showBackupBar: function(model) {
			return !!model.buttons.getLength();
		}
	});
})(ts.ui.PagerModel, ts.ui.ActionModel, gui.Combo.chained);
