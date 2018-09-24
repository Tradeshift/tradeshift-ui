/**
 * Advanced footer model.
 * @extends {ts.ui.Model}
 * @using {Class<PagerModel>} PagerModel
 * @using {Class<ts.ui.ActionModel>} ActionModel
 * @using {gui.Combo#chained} chained
 */
ts.ui.FooterBarModel = (function using(PagerModel, ActionModel, chained) {
	var translations = {
		id: 'Berkolaborasi Pada Ini',
		ms: 'Bekerjasama Ini',
		es: 'Colabora En Esto',
		da: 'Samarbejde På Dette',
		de: 'Arbeite Daran',
		'de-ch': 'Arbeite Daran',
		'en-gb': 'Collaborate On This',
		'en-us': 'Collaborate On This',
		fr: 'Collaborer Sur Ce',
		it: 'Collaborare Su Questo',
		hu: 'Együttműködjenek Erről',
		nl: 'Werk Hier Samen Aan',
		'nb-no': 'Samarbeide På Dette',
		pl: 'Współpracuj W Tym',
		'pt-br': 'Colabore Com Isso',
		'pt-pt': 'Colabore Com Isso',
		ro: 'Colaborați Pe Acest Lucru',
		sk: 'Spolupracujte Na Tom',
		fi: 'Tee Yhteistyötä Tämän Kanssa',
		'sv-se': 'Samarbeta På Detta',
		ja: 'コラボレーションする',
		'zh-cn': '合作就此',
		'zh-tw': '合作就此'
	};

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
		 * Clear everything.
		 * @returns {this}
		 */
		clear: chained(function() {
			this.pager = null;
			this.status = null;
			this.checkbox = null;
			this.configbutton(null);
			this.collabbutton(null);
			this.bufferbar.buttons.clear();
			this.actionbar.actions.clear();
			this.centerbar.actions.clear();
		}),

		/**
		 * Note: Also injected into bufferbar so that it can affect measurements.
		 * @returns {this|ts.ui.ButtonModel}
		 */
		configbutton: chained(function(onclick) {
			if (onclick === null) {
				this.bufferbar.configbutton = this.centerbar.configbutton = null;
			} else if (onclick) {
				this.bufferbar.configbutton = this.centerbar.configbutton = {
					onclick: onclick
				};
			} else {
				return this.centerbar.configbutton;
			}
		}),

		/**
		 * We'll just implement this as a regular `action` for now.
		 * TODO: Move this thing to the general {ts.ui.ToolBarModel}
		 * @returns {this|ts.ui.ActionModel}
		 */
		collabbutton: chained(function(onclick) {
			var actions = this.bufferbar.actions;
			if (arguments.length) {
				actions.clear();
				if (onclick !== null) {
					actions.push({
						label: translations[document.documentElement.lang],
						icon: 'ts-icon-collaboration',
						onclick: onclick
					});
				}
			} else {
				return actions[0] || null;
			}
		}),

		/**
		 * Enable and disable support for links in status message via Markdown.
		 * @param {boolean} [is]
		 * @returns {this}
		 */
		linkable: chained(function(is) {
			this.actionbar.linkable = !!is;
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
			return !!(model.buttons.getLength() || model.actions.getLength());
		}
	});
})(ts.ui.PagerModel, ts.ui.ActionModel, gui.Combo.chained);
