/**
 * Advanced form model.
 * @extends {ts.ui.Model}
 */
ts.ui.FormModel = (function using(chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'form',

		/**
		 * Form items constructor.
		 * @type {ts.ui.Collection<ts.ui.Model>}
		 */
		items: ts.ui.FormItemCollection,

		/**
		 * Form buttons collection. Buttons will appear below the form.
		 * They get scaled to full form width to cope with translation.
		 * TODO(jmo@): Render this via ButtonGroup once we actually need it!
		 * @type {ts.ui.ButtonCollection<ts.ui.ButtonModel>}
		 */
		buttons: ts.ui.ButtonCollection,

		/**
		 * [onsubmit description]
		 * @type {[type]}
		 */
		onsubmit: null,

		/**
		 * Observer myself.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.items = this.items || [];
			this.buttons = this.buttons || [];
			this.addObserver(this);
		},

		/**
		 * TODO (jmo@): Destruct is not really implemented (memory implications)
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.removeObserver(this);
		},

		/**
		 * Handle changes.
		 * @param {Array<gui.Change>} changes
		 */
		onchange: function(changes) {
			changes.forEach(function(c) {
				if (c.name === 'submitted' && c.newValue) {
					this.submitted = false;
					if (this.onsubmit) {
						this.onsubmit();
					}
				}
			}, this);
		},

		/**
		 * Trigger `onsubmit`.
		 * TODO (jmo@): validation!
		 * @return {ts.ui.FormModel}
		 */
		submit: chained(function() {
			this.submitted = true;
		}),

		/**
		 * Bounce model to HTML.
		 * @return {string}
		 */
		render: function() {
			return ts.ui.form.edbml(this);
		},

		/**
		 * Adds the Submit button which will submit all the things.
		 * @param {string=} opt_label
		 * @param {string=} opt_icon
		 * @return {ts.ui.DialogModel}
		 */
		submitButton: chained(function(opt_label, opt_icon) {
			this._button(
				opt_label || ts.ui.String.LABEL_SUBMIT,
				opt_icon || 'ts-icon-proceed',
				this.submit
			);
		}),

		// Private ...................................................................

		/**
		 * Add that button.
		 * @param {string} label
		 * @param {string} icon
		 * @param {function} action
		 */
		_button: function(label, icon, action) {
			var that = this;
			this.buttons.push({
				label: label,
				icon: icon,
				onclick: function() {
					if (action) {
						action.call(that);
					}
				}
			});
		}
	});
})(gui.Combo.chained);
