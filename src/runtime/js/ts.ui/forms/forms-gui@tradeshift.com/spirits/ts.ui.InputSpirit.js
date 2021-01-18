/**
 * Spirit of the textinput and textarea.
 * @extends {ts.ui.FieldSpirit}
 * @using {gui.Combo#chained}
 * @using {gui.Type} Type
 * @using {gui.Client} Client
 */
ts.ui.InputSpirit = (function using(chained, Type, Client) {
	return ts.ui.FieldSpirit.extend(
		{
			/**
			 * React replaces element.value setter with a custom setter which also maintains the tracker.
			 * In order to avoid also updating the tracker's value we should use prototype's value setter.
			 * @param {Element} element
			 * @param {string} value
			 */
			_setprotovalue: function(element, value) {
				var valueDescriptor = Object.getOwnPropertyDescriptor(element, 'value');
				// if the element doesn't have a **own property** it means that it relies on the prototype's property.
				// ergo no framework did redefine the value property.
				if (!valueDescriptor) {
					element.value = value;
					return;
				}

				var prototype = Object.getPrototypeOf(element);
				var prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
				prototypeValueSetter.call(element, value);
			},

			/**
			 * Shortcut `this.element.value` with an automated
			 * management of special classname for empty fields.
			 * Also fixes the (browser-inherrent) dysfunction
			 * where changing the value will move the caret to
			 * the end of the field.
			 * TODO: Global fix via https://github.com/wunderbyte/spiritual-edbml/issues/17
			 * @type {string}
			 */
			value: {
				getter: function() {
					return this.element.value;
				},
				setter: function(value) {
					value = this._evaluated(value);
					var idx = -1;
					var elm = this.element;
					var foc = document.activeElement;
					if (foc && foc === elm) {
						idx = elm.value.slice(0, elm.selectionStart).length;
					}
					this._snapshot = value;
					this._setprotovalue(elm, value);
					if (idx > -1 && elm.type !== 'date') {
						// can't select in date inputs
						elm.setSelectionRange(idx, idx);
					}
					if (!this.$destructed) {
						this._label(function(label) {
							label.$empty(!value);
						});
					}
				}
			},

			/**
			 * (Not currently used!)
			 * @type {ts.ui.ValidityModel}
			 */
			validity: null,

			/**
			 * Icon to use, overriding the default (date, select, disabled, etc.)
			 * @type {String|function}
			 */
			icon: null,

			/**
			 * Function to execute on idle (pause).
			 * @type {string|function}
			 */
			onidle: null,

			/**
			 * Time before user is considered idle.
			 * @type {number} Timeout in milliseconds
			 */
			idletime: Client.isTouchDevice ? 750 : 500,

			/**
			 * Function to execute on ENTER key.
			 * @type {string|function}
			 */
			onenterkey: null,

			/**
			 * Shortcut to 'this.element.disabled'.
			 * @type {boolean}
			 */
			disabled: {
				getter: function() {
					return this.att.has('disabled');
				},
				setter: function(is) {
					this.att.set('disabled', is);
				}
			},

			/**
			 * Shortcut to 'this.element.readonly'.
			 * @type {boolean}
			 */
			readonly: {
				getter: function() {
					return this.att.has('readonly');
				},
				setter: function(is) {
					this.att.set('readonly', is);
				}
			},

			/**
			 * Observe that model.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				if (this._ismodelled()) {
					this._setupmodel(this._model, true);
				}
			},

			/**
			 * Release the validity checker.
			 */
			ondestruct: function() {
				this.super.ondestruct();
				this._discount();
				if (this._ismodelled()) {
					this._setupmodel(this._model, false);
				}
			},

			/**
			 * Attach to the DOM.
			 */
			onattach: function() {
				this.super.onattach();
				this.element.spellcheck = false;
				this.element.autocomplete = 'off';
				this.disabled = this.att.has('disabled');
				this.att.add('onidle idletime disabled');
				this.event.add('input change invalid');
			},

			/**
			 * Handle event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				var model = this._model;
				switch (e.type) {
					case 'keydown':
						if (e.keyCode === 13) {
							this._snapshot = this.value;
							this._onenterkey(e);
						}
						break;
					case 'input':
					case 'change':
						var value = this.value;
						if (value !== this._snapshot) {
							this._snapshot = value;
							this._oninput(value);
						}
						break;
					case 'focus':
						this.event.add('keydown');
						if (model) {
							model.focused = true;
						}
						break;
					case 'blur':
						this.event.remove('keydown');
						if (this.value !== this._snapshot) {
							this._oncount();
						}
						if (model) {
							model.focused = false;
						}
						break;
				}
			},

			/**
			 * Handle model changes.
			 * @param {Array<edb.Change>} changes
			 */
			onchange: function(changes) {
				this.super.onchange(changes);
				changes.forEach(function(c) {
					this._onmodelchange(c.object, c.name, c.newValue, c.oldValue);
				}, this);
			},

			/**
			 * Handle attribute change (or listener added).
			 * @param {gui.Att} att
			 */
			onatt: function(att) {
				this.super.onatt(att);
				switch (att.name) {
					case 'disabled':
						this.disabled = this.att.has('disabled');
						break;
				}
			},

			/**
			 * Sugar not disabled.
			 * @returns {ts.ui.InputSpirit}
			 */
			enable: chained(function() {
				this.disabled = false;
			}),

			/**
			 * Sugar disabled.
			 * @returns {ts.ui.InputSpirit}
			 */
			disable: chained(function() {
				this.disabled = true;
			}),

			/**
			 * Clear the input.
			 * @returns {ts.ui.SearchSpirit}
			 */
			clear: chained(function() {
				this.value = '';
			}),

			/**
			 * Set or get the model.
			 * TODO: Move all this to ancestor spirit (ts.ui.Spirit)?
			 * @param {ts.ui.InputModel} model
			 * @returns {ts.ui.InputSpirit|ts.ui.InputModel}
			 */
			model: chained(function(model) {
				if (arguments.length) {
					if (ts.ui.InputModel.is(model)) {
						if (model !== this._model) {
							// TODO(jmo@): edbml.$get should fix this: https://github.com/wunderbyte/spiritual-edbml/issues/14
							if (this._model) {
								this._setupmodel(this._model, false);
							}
							this._model = model;
							this._setupmodel(model, true);
						}
					} else {
						throw new TypeError('InputModel expected');
					}
				} else {
					return this._model;
				}
			}),

			// Privileged ..............................................................

			/**
			 * Style the form.
			 */
			$updatestyling: function() {
				this.super.$updatestyling();
				this._label(function(label) {
					label.$empty(!this.value);
					label.$customicon(this.icon, this.att.has('data-ts.icon'));
				});
			},

			// private .................................................................

			/**
			 * Optional model thing.
			 * @type {ts.ui.InputModel}
			 */
			_model: null,

			/**
			 * Tracking the value to detect actual value-changes (ex. arrow keys etc).
			 * @type {string}
			 */
			_snapshot: null,

			/**
			 * Timeout key.
			 * @type {number}
			 */
			_timeout: -1,

			/**
			 * Temporarily suspending evaluation of `onenterkey` (if assigned)?
			 * @see {ts.ui.TextAreaSpirit} Can be setup to require SHIFT+ENTER.
			 * @type {boolean}
			 */
			_suspendenterkey: false,

			/**
			 * Setup the model (and unsetup any potential old model).
			 * @param {ts.ui.InputModel} model
			 * @param {boolean} setup Setup or unsetup?
			 */
			_setupmodel: function(model, setup) {
				if (setup) {
					model.addObserver(this);
				} else {
					model.removeObserver(this);
				}
				this.onidle = setup
					? function() {
							model.idle = true;
					  }
					: null;
				this.onenterkey = setup
					? function() {
							model.enterkey = true;
					  }
					: null;
				if (setup) {
					if (model.value) {
						this.value = model.value;
					}
					if (model.focused) {
						this.element.focus();
					}
				}
			},

			/**
			 * Countdown on idle.
			 */
			_countdown: function() {
				this._discount();
				this._timeout = this.tick.time(function() {
					this._oncount();
				}, this.idletime);
			},

			/**
			 * Compile and invoke idle function.
			 */
			_oncount: function() {
				this._discount();
				this._maybeinvoke(this.onidle, this.value);
			},

			/**
			 * Clear the idle timeout.
			 */
			_discount: function() {
				clearTimeout(this._timeout);
				this._timeout = -1;
			},

			/**
			 * Input value changed.
			 * @param {string} value
			 */
			_oninput: function(value) {
				this._label(function(label) {
					label.$empty(!value);
				});
				if (this.onidle) {
					this._countdown();
				}
				if (this._ismodelled()) {
					this._model.value = value;
				}
			},

			/**
			 * Handle model change. Some of this can be moved to EDBML pending
			 * https://github.com/wunderbyte/spiritual-edbml/issues/4 (NOW FIXED!).
			 * @param {ts.ui.Model} model
			 * @param {string} name
			 * @param {object} value
			 * @param {object} oldvalue
			 */
			_onmodelchange: function(model, name, value, oldvalue) {
				if (model === this._model) {
					switch (name) {
						case 'value':
							this.value = value;
							if (!value) {
								this._label(function(label) {
									label.$empty(true);
								});
							}
							break;
						case 'focused':
							if (value) {
								this.element.focus();
							} else {
								this.element.blur();
							}
							break;
					}
				}
			},

			/**
			 * Note that a 'preventDefault()' will prevent IE10 from clearing
			 * the value of the input for reasons that remain a mystery. This
			 * will however prevent buttons in forms from submittin, so let's
			 * think about this some more.
			 * @param {KeyEvent} e
			 */
			_onenterkey: function(e) {
				if (!this._suspendenterkey) {
					if (this._maybeinvoke(this.onenterkey, this.value)) {
						this._discount();
					}
				}
				if (this.element.localName !== 'textarea') {
					// e.preventDefault(); // see comment above...
				}
			}
		},
		{
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @return {ts.ui.InputSpirit}
			 */
			summon: function() {
				return this.possess(document.createElement('input'));
			}
		}
	);
})(gui.Combo.chained, gui.Type, gui.Client);
