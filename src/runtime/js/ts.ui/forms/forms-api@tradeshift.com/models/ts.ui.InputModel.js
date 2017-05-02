/**
 * Advanced input model.
 * @using {gui.Client} Client
 * @using {gui.Combo#chained} chained
 */
ts.ui.InputModel = (function using(Client, chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'input',

		/**
		 * Input type matches text|email|search|url|number|password etc.
		 * @type {string}
		 */
		type: 'text',

		/**
		 * Input name.
		 * @type {string}
		 */
		name: '',

		/**
		 * Input value.
		 * @type {string}
		 */
		value: '',

		/**
		 * Input label.
		 * @type {string}
		 */
		label: '',

		/**
		 * Input placeholder.
		 * @type {string}
		 */
		placeholder: '',

		/**
		 * Icon to use, overriding the default (date, select, disabled, etc.)
		 * @type {String}
		 */
		icon: '',

		/**
		 * Is idle? Used for xframe synchronization.
		 * @type {boolean}
		 */
		idle: false,

		/**
		 * Pressed ENTER? Used for xframe synchronization.
		 * @type {boolean}
		 */
		enterkey: false,

		/**
		 * Time before user is considered idle.
		 * @type {number} Timeout in milliseconds
		 */
		idletime: Client.isTouchDevice ? 750 : 500,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onidle: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onenterkey: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onfocus: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onblur: null,

		/**
		 * Required?
		 * @type {boolean}
		 */
		required: false,

		/**
		 * Read only?
		 * @type {boolean}
		 */
		readonly: false,

		/**
		 * Disabled?
		 * @type {boolean}
		 */
		disabled: false,

		/**
		 * Input has focus?
		 * @type {boolean}
		 */
		focused: false,

		/**
		 * Attempt to focus this field?
		 * TODO(jmo@: Actually support this
		 * @type {boolean}
		 */
		autofocus: false,

		/**
		 * A localized message that describes the validation constraints
		 * that the control does not satisfy (if any).
		 * @type {string}
		 */
		validationMessage: {
			getter: function() {
				return this._validationMessage;
			}
		},

		/**
		 * Tracking input validity state.
		 * @type {ts.ui.ValidityStateModel}
		 */
		validity: ts.ui.ValidityStateModel,

		/**
		 * Observe myself on startup.
		 * @return {[type]} [description]
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.validity = {};
			this.addObserver(this);
		},

		/**
		 * Stop observing myself on shutdown.
		 * TODO (jmo@): Destruct is not really implemented (memory implications)
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.removeObserver(this);
			this._checker = null;
		},

		/**
		 * This stuff is sort of disabled for now. Maybe we'll bring it back.
		 * @returns {boolean}
		 */
		checkValidity: function() {
			this._checker = this._checker || new ts.ui.ValidityChecker();
			return this._checker.checkValidity(this, this.validity);
		},

		/**
		 * Invalidates the field and shows a custom error message.
		 * Use empty string to mark field valid and remove message.
		 * @param {string} error
		 */
		setCustomValidity: function(error) {
			this.validity.customError = !!error;
			this.validity.valid = !error;
			this._validationMessage = error || '';
		},

		/**
		 * Handle changes.
		 * @param {Array<gui.Change>} changes
		 */
		onchange: function(changes) {
			changes.forEach(function(c) {
				this._onpropertychange(c.name, c.newValue);
			}, this);
		},

		/**
		 * Focus the field.
		 */
		focus: function() {
			this.focused = true;
		},

		/**
		 * Blur the field.
		 */
		blur: function() {
			this.focused = false;
		},

		/**
		 * Clear that value.
		 */
		clear: function() {
			this.value = '';
		},

		/**
		 * Bounce model to HTML.
		 * @return {string}
		 */
		render: function() {
			return ts.ui.input.edbml(this);
		},

		// Private .................................................................

		/**
		 * Validity checker (not used now).
		 * @type {ts.ui.ValidityChecker}
		 */
		_checker: null,

		/**
		 * Snapshot the value so that we never fire the
		 * `onidle` callback twice for the same value.
		 * @type {string}
		 */
		_snapshot: null,

		/**
		 * Property was changed (note that this model is observing itself
		 * because of all this xframe synchronization stuff going on).
		 * @param {string} name
		 * @param {string|boolean} value
		 */
		_onpropertychange: function(name, value) {
			var isTrue = value === true;
			switch (name) {
				case 'idle':
					if (isTrue) {
						this.idle = false;
						if ((value = this.value) !== this._snapshot) {
							this._maybeinvoke(this.onidle, value);
							this._snapshot = value;
						}
					}
					break;
				case 'enterkey':
					if (isTrue) {
						this.enterkey = false;
						this._maybeinvoke(this.onenterkey, this.value);
					}
					break;
				case 'focused':
					if (isTrue) {
						this._maybeinvoke(this.onfocus);
					} else {
						this._maybeinvoke(this.onblur);
					}
					break;
				case 'value':
					this.checkValidity();
					break;
			}
		}
	});
})(gui.Client, gui.Combo.chained);
