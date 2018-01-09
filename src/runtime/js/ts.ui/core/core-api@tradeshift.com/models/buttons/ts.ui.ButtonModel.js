/**
 * Advanced button model.
 * @extends {ts.ui.Model}
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Type} Type
 */
ts.ui.ButtonModel = (function using(chained, confirmed, Type) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'button',

		/**
		 * Button label.
		 * @type {String}
		 */
		label: null,

		/**
		 * Button icon.
		 * @type {String}
		 */
		icon: null,

		/**
		 * Button tooltip.
		 * @type {string}
		 */
		info: null,

		/**
		 * Stretch to fill the space? Support
		 * for this depends on the use case.
		 * @type {number} (treated as truthy for now)
		 */
		flex: 0,

		/**
		 * Type is really the CSS classname. Defaults to "ts-tertiary"
		 * @type {String}
		 */
		type: ts.ui.CLASS_TERTIARY,

		/**
		 * Reverse label and icon? If true,
		 * button width will be set to 100%.
		 * @type {boolean}
		 */
		reverse: false,

		/**
		 * Something to execute onclick.
		 * @type {function}
		 */
		onclick: null,

		/**
		 * Visible?
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * Disabled?
		 * @type {boolean}
		 */
		disabled: false,

		/**
		 * No default keyboard support until the
		 * whole keyboard things has been worked.
		 * @type {number}
		 */
		tabindex: -1,

		/**
		 * HTML should add the `autofocus` attribute?
		 * @type {boolean}
		 */
		autofocus: false,

		/**
		 * Busy message.
		 * @type {string}
		 */
		busystatus: null,

		/**
		 * Button name.
		 * @type {string}
		 */
		name: null,

		/**
		 * Button value. Also used for sorting (in the Table).
		 * @type {Any}
		 */
		value: null,

		/**
		 * The `action.type` that will dispatch when clicked (internal use).
		 * @type {string}
		 */
		action: null,

		/**
		 * Dispatched as the `action.data` (internal use).
		 * @type {Any}
		 */
		data: null,

		/**
		 * Click that button.
		 * @returns {ts.ui.ButtonModel}
		 */
		click: chained(function() {
			if (Type.isFunction(this.onclick)) {
				setTimeout(
					function unfreeze() {
						this.onclick();
					}.bind(this),
					ts.ui.TIMEOUT_UNFREEZE
				);
			}
		}),

		/**
		 * Show button.
		 * @returns {ts.ui.ButtonModel}
		 */
		show: chained(function() {
			this.visible = true;
		}),

		/**
		 * Hide button.
		 * @returns {ts.ui.ButtonModel}
		 */
		hide: chained(function() {
			this.visible = false;
		}),

		/**
		 * Enable button.
		 * @returns {ts.ui.ButtonModel}
		 */
		enable: chained(function() {
			this.disabled = false;
		}),

		/**
		 * Disable button.
		 * @returns {ts.ui.ButtonModel}
		 */
		disable: chained(function() {
			this.disabled = true;
		}),

		/**
		 * Mark as busy.
		 * @param @optional {string} label
		 * @returns {ts.ui.ButtonModel}
		 */
		busy: confirmed('(string)')(
			chained(function(label) {
				this.busystatus = label || true;
			})
		),

		/**
		 * Mark as done.
		 * @returns {ts.ui.ButtonModel}
		 */
		done: chained(function() {
			this.busystatus = null;
		}),

		/**
		 * Is primary button?
		 * @returns {boolean}
		 */
		isPrimary: function() {
			return this.type.includes(ts.ui.CLASS_PRIMARY);
		},

		/**
		 * Bounce model to HTML.
		 * @param {boolean} [isButtonMenu] - Is the button as a menu?
		 * @param {boolean} [isMobile] - attempt to render the icon only?
		 * @return {string}
		 */
		render: function(isButtonMenu, isMobile) {
			return ts.ui.button.edbml(this, isButtonMenu, isMobile);
		},

		// Private .................................................................

		/**
		 *
		 */
		_oldlabel: null
	});
})(gui.Combo.chained, gui.Arguments.confirmed, gui.Type);
