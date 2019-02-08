/**
 * Spirit of the dialog.
 * @extends {ts.ui.Spirit}
 * @using {ts.ui.Dialog} Dialog
 * @using {gui.Client} Client
 * @using {gui.Combo#chained} chained
 * @using {gui.Type} Type
 */
ts.ui.DialogSpirit = (function using(Dialog, Client, chained, Type) {
	var willopen = ts.ui.BROADCAST_DIALOG_WILL_OPEN,
		goopen = ts.ui.BROADCAST_DIALOG_GO_OPEN,
		didopen = ts.ui.BROADCAST_DIALOG_DID_OPEN,
		willclose = ts.ui.BROADCAST_DIALOG_WILL_CLOSE,
		didclose = ts.ui.BROADCAST_DIALOG_DID_CLOSE;

	return ts.ui.Spirit.extend(
		{
			/**
			 * Is open?
			 * @type {boolean}
			 */
			isOpen: false,

			/**
			 * If (and only if) there's no dialog buttons,
			 * automatically fade away at specified time.
			 * @type {number} in milliseconds
			 */
			time: Dialog.DEFAULT_TIME,

			/**
			 * Big icon goes here.
			 * @see `ts-icons.less`
			 * @type {string}
			 */
			icon: null,

			/**
			 * Should block modal stylee?
			 * @type {boolean}
			 */
			blocking: {
				getter: function() {
					return !!this._buttons();
				}
			},

			/**
			 * Classname the dialog. Hide on startup.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.css.add(ts.ui.CLASS_DIALOG);
				if (this._transition) {
					this.css.add(ts.ui.CLASS_TRANSITION);
				}
				this.dom.hide();
			},

			/**
			 * Sync the {ts.ui.DocumentDialogPlugin}
			 */
			ondestruct: function() {
				this.super.ondestruct();
				if (this.isOpen) {
					this.broadcast.dispatch(didclose);
				}
			},

			/**
			 * Forcefully open the dialog in case `isOpen`
			 * was transferred here from a model property.
			 */
			onready: function() {
				this.super.onready();
				if (this._ismodelled()) {
					this._setupmodel();
				}
				if (this.isOpen) {
					this.open(true, true);
				}
			},

			/**
			 * Handle action.
			 * @param {gui.Action} a
			 */
			onaction: function(a) {
				this.super.onaction(a);
				switch (a.type) {
					case ts.ui.ACTION_SAFE_LINK:
						if (this._ismodelled()) {
							// TODO(jmo@): Wait for animation to finish - close() should promise
							// TODO(jmo@): Rig this up for xframe setup
							if (Type.isFunction(this._model.onlink)) {
								this._model.onlink(a.data);
							}
						}
						break;
				}
			},

			/**
			 * Open AND close the dialog. Setup to support the HTML
			 * attribute: gui.open="true|false".
			 * @param @optional {boolean} opt_open Omit to simply open.
			 * @param @optional {boolean} opt_force Force dialog open.
			 * @return {ts.ui.AsideSpirit}
			 */
			open: chained(function(opt_open, opt_force) {
				if (!Type.isBoolean(opt_open) || opt_force) {
					opt_open = true;
				}
				this.att.set('gui.open', opt_open);
				if (opt_open) {
					if (!this.isOpen || opt_force) {
						this.isOpen = true;
						this._open(this.life.async);
					}
				} else {
					if (this.isOpen) {
						this.isOpen = false;
						this._close(this.life.async);
					}
				}
			}),

			/**
			 * Close that dialog.
			 * @returns {ts.ui.DialogSpirit}
			 */
			close: chained(function() {
				this.open(false);
			}),

			/**
			 * Cancel that dialog. Defaults
			 * to simply closing the dialog.
			 */
			cancel: chained(function() {
				var model = this._model;
				if (model && model.oncancel) {
					model.oncancel.call(model);
				} else {
					this.close();
				}
			}),

			/**
			 * The {ts.ui.Dialog} will now synchronize
			 * the click event across iframes, if needed.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				switch (e.type) {
					case 'transitionend':
						if (e.target === this.element) {
							this.event.remove(e.type);
							this._ontransitionend();
							e.stopPropagation();
						}
						break;
					case 'click':
						if (!this.blocking) {
							this.event.remove(e.type);
							if (this._ismodelled()) {
								this._model.accept();
							} else {
								this.accept();
							}
						}
						break;
				}
			},

			/**
			 * Called by the {ts.ui.DocumentDialogPlugin}
			 * if other dialogs are currently in progress.
			 */
			suspend: function() {
				this._suspended = true;
			},

			/**
			 * Called by the {ts.ui.DocumentDialogPlugin}
			 * when no other dialogs are in progress no more.
			 */
			unsuspend: function() {
				this._suspended = false;
				this._goopen();
			},

			/**
			 * Handle key.
			 * @param {gui.Key} k
			 */
			onkey: function(k) {
				this.super.onkey(k);
				if (k.down && k.type === 'Esc') {
					if (this._ismodelled()) {
						var model = this._model;
						var buttons = model.buttons;
						var cancel = buttons.get('cancel');
						if (buttons.length && cancel) {
							model.cancel();
						} else {
							model.accept();
						}
					}
				}
			},

			// Private .................................................................

			/**
			 * Potential model going on.
			 * @type {ts.ui.DialogModel}
			 */
			_model: null,

			/**
			 * Timeout ID for autofadeout scenario.
			 * @type {number}
			 */
			_timeout: -1,

			/**
			 * Waiting for other dialogs to close?
			 * @type {boolean}
			 */
			_suspended: false,

			/**
			 * Use fancy transitions?
			 * @type {boolean}
			 */
			_transition: gui.Client.hasTransitions,

			/**
			 * Do something with the model.
			 * TODO (jmo@): Perhaps support injection of new model.
			 */
			_setupmodel: function() {
				// copy matching properties from model onto spirit
				// TODO(jmo@): just manually stamp relevant properties
				this.action.add(ts.ui.ACTION_SAFE_LINK);
				gui.Object.nonmethods(this._ismodelled()).forEach(function(key) {
					if (this[key] !== undefined) {
						this[key] = this._model[key];
					}
				}, this);
				this.script.load(ts.ui.DialogSpirit.edbml).input(this._model);
			},

			/**
			 * Open it.
			 * @param {boolean} animated (TODO)
			 */
			_open: chained(function(animated) {
				var oldie = Client.isExplorer9 || Client.isExplorer10;
				if (!this.blocking) {
					this.css.add(ts.ui.CLASS_NONBLOCKING);
				}
				if (this._ismodelled()) {
					this._model.$finalize(); // thus will trigger re-render...
				}
				this.tick.time(
					function wait_for_finalize() {
						// wait for re-render
						this._willopen();
					},
					oldie ? 100 : 10
				);
			}),

			/**
			 * Close it.
			 * @param {boolean} animated (TODO)
			 */
			_close: chained(function(animated) {
				this._willclose();
			}),

			/**
			 * About to open.
			 */
			_willopen: function() {
				this._trapattention();
				if (this._ismodelled()) {
					switch (this._model.type) {
						case Dialog.SUCCESS:
							break;
						default:
							this.css.add('ts-bg-darkened'); // this now only affects the button outline!
							break;
						/*
						case Dialog.INFO:
						case Dialog.CONFIRM:
							this.css.add('ts-bg-darkened');
							break;
						case Dialog.SUCCESS:
							this.css.add('ts-bg-green');
							break;
						case Dialog.WARNING:
							this.css.add('ts-bg-yellow');
							break;
						case Dialog.ERROR:
						case Dialog.DANGER:
							this.css.add('ts-bg-red');
							break;
						*/
					}
				}
				this.broadcast.dispatch(willopen);
				if (!this._suspended) {
					this._goopen();
				}
			},

			/**
			 * Let's open it.
			 */
			_goopen: function() {
				var model = this._model;
				this.broadcast.dispatch(goopen);
				this.dom.show();
				if (this._transition) {
					this.tick.time(function() {
						this.event.add('transitionend');
						this.css.add(ts.ui.CLASS_OPENING);
					}, ts.ui.TRANSITION_NOW);
				} else {
					this._didopen();
				}
				if (this._ismodelled()) {
					model.state = 'onopen';
					this._doclassnames(this._model);
					this._focusdefault(this._buttons());
				}
			},

			/**
			 * It managed to open. If there's no buttons, setup to
			 * automatically close after a timeout; and also to
			 * close when the dialog is clicked.
			 */
			_didopen: function() {
				this.css.remove(ts.ui.CLASS_OPENING).add(ts.ui.CLASS_OPEN);
				this.broadcast.dispatch(didopen);
				this.key.addGlobal('Esc');
				if (!this.blocking) {
					this.event.add('click');
					var time = this._ismodelled() ? this._model.time : this.time;
					this._timeout = this.tick.time(function() {
						this.close();
					}, time);
				}
				if (this._ismodelled()) {
					this._model.state = 'onopened';
				}
			},

			/**
			 * About to close.
			 */
			_willclose: function() {
				this.tick.cancelTime(this._timeout);
				this.broadcast.dispatch(willclose);
				this.event.remove('click');
				this.key.removeGlobal('Esc');
				if (this._transition) {
					this.event.add('transitionend');
					this.css.remove(ts.ui.CLASS_OPEN).add(ts.ui.CLASS_CLOSING);
				} else {
					this._didclose();
				}
				if (this._ismodelled()) {
					this._model.state = 'onclose';
				}
			},

			/**
			 * It really did close. Remove and dispose
			 * so that it's not possible to reuse this.
			 */
			_didclose: function() {
				this.broadcast.dispatch(didclose);
				this.css.remove([ts.ui.CLASS_OPEN, ts.ui.CLASS_CLOSING]);
				this.attention.exit();
				this.dom.remove();
				if (this._ismodelled()) {
					var model = this._model;
					model.state = 'onclosed';
					this.tick.time(function terminate() {
						model.dispose();
					});
				}
			},

			/**
			 * Transition has ended. No more fun.
			 */
			_ontransitionend: function() {
				if (this.isOpen) {
					this._didopen();
				} else {
					this._didclose();
				}
			},

			/**
			 * Setup bonus classnames to make the LESS more manageable.
			 * @param {string} type
			 * @param {string} icon
			 * @param {ts.ui.ButtonCollection} buttons
			 */
			_doclassnames: function(model) {
				var count = model.buttons.length;
				this.css
					.add(model.type)
					.shift(model.icon, 'ts-hasicon')
					.shift(count, 'ts-hasbuttons')
					.shift(count > 1, 'ts-hasmorebuttons');
			},

			/**
			 * Lock the keyboard navigation to the buttons area.
			 */
			_trapattention: function() {
				var buttons = this._buttons();
				if (buttons && !this.attention.trapping) {
					this.attention.trap(buttons);
				}
			},

			/**
			 * Autofocus the default button.
			 * @param {HTMLMenuElement} buttons
			 */
			_focusdefault: function(buttons) {
				var button;
				if (buttons && (button = buttons.querySelector('[autofocus]'))) {
					button.focus();
				}
			},

			/**
			 * Lookup buttons menu OR button at given index.
			 * @param @optional {number} index
			 * @returns {HTMLMenuElement|HTMLButtonElement}
			 */
			_buttons: function(index) {
				var result = this.dom.q('.ts-dialog-buttons .ts-buttons');
				if (result && arguments.length) {
					result = result.querySelectorAll('.ts-button')[index];
				}
				return result;
			}
		},
		{
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @param @optional {ts.ui.DialogModel} opt_model
			 * @return {ts.ui.DialogSpirit}
			 */
			summon: function(opt_model) {
				var spirit = this.possess(document.createElement('div'));
				spirit._model = opt_model || null;
				return spirit;
			}
		}
	);
})(ts.ui.Dialog, gui.Client, gui.Combo.chained, gui.Type);
