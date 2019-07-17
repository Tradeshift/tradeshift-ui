/**
 * Advanced dialog model.
 * @extends {ts.ui.Model}
 * @using {ts.ui.Dialog} Dialog
 * @using {gui.Combo#chained} chained
 * @using {gui.Type} Type
 * @using {gui.Object} GuiObject
 * @using {ts.ui.String} Constants
 * @using {string} primary
 * @using {string} secondary
 * @using {string} tertiary
 */
ts.ui.DialogModel = (function using(
	Dialog,
	chained,
	Type,
	GuiObject,
	Constants,
	primary,
	secondary,
	tertiary
) {
	/**
	 * Get JSON for button where the properties of the passed
	 * JSON will overwrite the given (default) label and type.
	 * The {ts.ui.DialogSpirit} may modify the `type` property.
	 * @param {object} json Button configuration
	 * @param {string} id So that we can find it later
	 * @param {string} label Default label
	 * @param {string} type Default type
	 * @returns {object}
	 */
	function getbutton(json, id, label) {
		return GuiObject.extendmissing(json || {}, {
			type: 'ts-secondary',
			label: label,
			tabindex: 0,
			id: id
		});
	}

	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'dialog',

		/**
		 * This is really just a CSS classname.
		 * @type {string}
		 */
		type: null,

		/**
		 * Dialog content items (excluding the buttons).
		 * @type {ts.ui.Collection<ts.ui.Model>}
		 */
		items: ts.ui.DialogItemCollection,

		/**
		 * Dialog buttons list. You can add custom buttons here much like you would
		 * add buttons to the topbar, see documentation for {ts.ui.TopBar}.
		 * @type {ts.ui.ButtonCollection<ts.ui.Button>}
		 */
		buttons: ts.ui.ButtonCollection,

		/**
		 * Strange property used to synchronize dialog state iframes.
		 * @type {string}
		 */
		state: null,

		/**
		 * Dialog icon.
		 * @type {string}
		 */
		icon: null,

		/**
		 * Is open?
		 * @type {boolean}
		 */
		isOpen: false,

		/**
		 * Is clicked?
		 * @type {boolean}
		 */
		isClicked: false,

		/**
		 * Stub.
		 * @type {function}
		 */
		onaccept: null,

		/**
		 * Stub.
		 * @type {function}
		 */
		oncancel: null,

		/**
		 * Stub.
		 * @type {function}
		 */
		onhelp: null,

		/**
		 * Stub.
		 * @type {function}
		 */
		oninfo: null,

		/**
		 * Stub.
		 * @type {function}
		 */
		onopen: null,

		/**
		 * Stub.
		 * @type {function}
		 */
		onopened: null,

		/**
		 * Stub.
		 * @type {function}
		 */
		onclose: null,

		/**
		 * Stub.
		 * @type {function}
		 */
		onclosed: null,

		/**
		 * Stub for something that should happen when the dialog is clicked.
		 * The dialog becomes something like a big button with this thing on.
		 * @type {function}
		 */
		onclick: null,

		/**
		 * Stub for something that should happen
		 * when a link in the dialog is clicked.
		 * @type {function}
		 */
		onlink: null,

		/**
		 * If (and only if) there's no dialog buttons,
		 * automatically fade away at specified time.
		 * @type {number} in milliseconds
		 */
		time: Dialog.DEFAULT_TIME,

		/**
		 * Limit tags parsed in markdown. if *not* specified, we default
		 * to all supported tags. Not that markdown is currently only
		 * supported in the {ts.ui.TextModel}.
		 * @type {Array<string>}
		 */
		tags: null, // for example ['a', 'strong', 'em', 'code']

		/**
		 * ID of the (default) focused button. Matches accept|cancel|info|help.
		 * The {ts.ui.DialogSpirit} will make sure to focus the button.
		 * @type {string}
		 */
		focused: null,

		/**
		 * ID of the primary button. Matches accept|cancel|info|help.
		 * If there's only one button, the {ts.ui.DialogSpirit} will
		 * make this button primary when it opens the dialog.
		 * @type {number}
		 */
		primary: null,

		/**
		 * Construction time.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.items = this.items || [];
			this.buttons = this.buttons || [];
			this.addObserver(this);
			this.time = this._computetime(
				this.items.find(function(item) {
					return ts.ui.TextModel.is(item);
				})
			);
		},

		/**
		 * Handle changes.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			changes.forEach(function(c) {
				if (c.name === 'state') {
					var method = c.newValue;
					if (this[method]) {
						this[method]();
					}
				}
			}, this);
		},

		/**
		 * Adds the OK button which will accept whatever is going on.
		 * @param {object} json
		 * @return {ts.ui.DialogModel}
		 */
		acceptButton: chained(function(json) {
			var label = Constants.LABEL_ACCEPT;
			if (json !== null) {
				this._addButton(0, getbutton(json, 'accept', label));
			}
		}),

		/**
		 * Adds the help button for displaying help about the dialog.
		 * @param {object} json
		 * @return {ts.ui.DialogModel}
		 */
		helpButton: chained(function(json) {
			var label = Constants.LABEL_HELP;
			if (json !== null) {
				this._addButton(1, getbutton(json, 'help', label));
			}
		}),

		/**
		 * Adds some kind of button to show more information (disclosure etc).
		 * @param {object} json
		 * @return {ts.ui.DialogModel}
		 */
		infoButton: chained(function(json) {
			var label = Constants.LABEL_INFO;
			if (json !== null) {
				this._addButton(2, getbutton(json, 'info', label));
			}
		}),

		/**
		 * Adds the cancel button which will cancel the operation. If the focused
		 * button has not been specified via JSON input, theis button gets focused.
		 * @param {object} json
		 * @return {ts.ui.DialogModel}
		 */
		cancelButton: chained(function(json) {
			var label = Constants.LABEL_CANCEL;
			if (json !== null) {
				// Cancel button should always be the last one.
				this._addButton(this.buttons.length, getbutton(json, 'cancel', label));
			}
		}),

		/**
		 * Adds the custom action buttons. For cases that there are more options than just accept or remove
		 * @param {array} actions
		 * @return {ts.ui.DialogModel}
		 */
		customButtons: chained(function(actions) {
			var self = this;
			actions.forEach(function(action, index) {
				if (action !== null) {
					self._addButton(index + 1, getbutton(action));
				}
			});
		}),

		/**
		 * Show the dialog.
		 * @return {ts.ui.DialogModel}
		 */
		open: function() {
			var then = new gui.Then();
			ts.ui.ready(function() {
				// TODO: this would not exist in "Greenfield" :/
				this.isOpen = true;
				gui.Tick.time(function transitiondone() {
					// TODO(jmo@): hook up right!
					then.now();
				}, ts.ui.TRANSITION_FAST);
			}, this);
			return then;
		},

		/**
		 * Accept the dialog.
		 * @returns {gui.Then}
		 */
		accept: function() {
			if (!this.buttons.length || this.buttons.get('accept')) {
				return this._close(function onfadeout() {
					if (this.onaccept) {
						this.onaccept();
					}
				}, this);
			} else {
				throw new Error('This dialog cannot be accepted');
			}
		},

		/**
		 * Cancel the dialog.
		 * @returns {gui.Then}
		 */
		cancel: function() {
			if (this.buttons.get('cancel')) {
				return this._close(function onfadeout() {
					if (this.oncancel) {
						this.oncancel();
					}
				}, this);
			} else {
				throw new Error('This dialog cannot be canceled. Try dialog.accept()');
			}
		},

		// Privileged ..............................................................

		/**
		 * Determine primary button and focused button just-in-time.
		 * The {ts.ui.DialogSpirit} will call this method when it opens
		 * the dialog, but it should really be computed incrementally
		 * if and when we want to support completely custom dialogs.
		 */
		$finalize: function() {
			if (this._validatestuff()) {
				this._optimusprime(this.buttons, this.primary);
				this._focusdefault(this.buttons, this.focused);
			}
		},

		// Private .................................................................

		/**
		 * Close the dialog. Standard buttons will
		 * automatically invoke this when pressed.
		 * @returns {ts.ui.DialogModel}
		 */
		_close: function(cb, thisp) {
			var then = new gui.Then();
			ts.ui.ready(function() {
				this.isOpen = false;
				// TODO(jmo@): hook up right (in the spirit)!
				gui.Tick.time(function transitiondone() {
					if (cb) {
						cb.call(thisp);
					}
					then.now();
				}, ts.ui.TRANSITION_FAST);
			}, this);
			return then;
		},

		/**
		 * Add that button. Button will close the dialog when clicked.
		 * Note that a method name is matched to an ID string here.
		 * @param {number} index Standard buttons follow an order
		 * @param {object} json
		 * @returns {number} The resulting index of the new button
		 */
		_addButton: function(index, json) {
			var that = this;
			var maxi = this.buttons.length;
			var onclick = json.onclick;
			index = index > maxi ? maxi : index;
			index = index < 0 ? 0 : index;
			this.buttons.splice(
				index,
				0,
				GuiObject.extend(json, {
					onclick: function() {
						var action = that['on' + json.id];
						that._close().then(function onfadeout() {
							if (action) {
								action.call(that);
							}
							// call the provided callback for custom actions
							if (onclick) {
								onclick();
							}
						});
					}
				})
			);
			return index;
		},

		/**
		 * The `time` property is used to figure out how long the
		 * dialog is visible if there's no buttons to close it. We'll
		 * let the text length determine this. Note that this code must
		 * be revisited if we get more complex dialogs at some point,
		 * since at that point we may have multiple text models around.
		 * These models may be added after the dialog is opened and
		 * the missing buttons might also be added later :/
		 * @param {ts.ui.TextModel} model
		 * @returns {number} Time in milliseconds
		 */
		_computetime: function(model) {
			var timer = 180 * (model ? model.text : '').split(' ').length;
			return timer < 1500 ? 1500 : timer;
		},

		/**
		 * Compute the optimal primary button and make it primary.
		 * 1. The user can specify this button via the `primary` prop
		 * 2. If there's only one button, we'll NOT make that primary.
		 * 3. Or do nothing! It's perfectly fine, not to have a primary
		 */
		_optimusprime: function(buttons, userset) {
			var primaryType = 'ts-primary';
			if (
				!buttons.some(function(b) {
					return b.type === primaryType;
				})
			) {
				var b = buttons.get(userset);
				/* single button not primary no more!
				if (!b && buttons.length === 1) {
					b = buttons.get(0);
				}
				*/
				if (b) {
					b.type = primaryType;
				}
			}
		},

		/**
		 * Compute the optimal focused button and make it focused.
		 * 1. The user can specify this button via the `focused` prop
		 * 2. If not specified, attempt to always focus Cancel button
		 * 3. If there is none, focus the first (probably only) button
		 */
		_focusdefault: function(buttons, userset) {
			var b = buttons.get(userset || 'cancel') || buttons.get(0);
			if (b) {
				b.autofocus = true;
			}
		},

		/**
		 * Validation of stuff can in theory be performed here.
		 * @returns {boolean}
		 */
		_validatestuff: function() {
			return true;
		}
	});
})(
	ts.ui.Dialog,
	gui.Combo.chained,
	gui.Type,
	gui.Object,
	ts.ui.String,
	ts.ui.CLASS_PRIMARY,
	ts.ui.CLASS_SECONDARY,
	ts.ui.CLASS_TERTIARY
);
