/**
 * Spirit of the textarea.
 *
 * TODO: If the textarea or container for some reason is display:none,
 * then it will look strange once it gets shown, perhaps we can work
 * around this by creating a mirror-textarea (in the root of BODY)
 * and then do measurements here?
 *
 * @extends {ts.ui.TextInputSpirit}
 * @using {gui.Type} Type
 * @using {gui.Client} Client
 * @using {number} UNIT
 * @using {string} tick
 * @using {number} time
 */
ts.ui.TextAreaSpirit = (function using(Type, Client, UNIT, tick, time) {
	return ts.ui.TextInputSpirit.extend(
		{
			/**
			 * When false, ENTER will make the textarea grow (to a certain limit).
			 * When true, only SHIFT+ENTER will do that (chat comment style) and
			 * the ENTER key can be freed up to other purposes (eg. submit comment).
			 * In HTML, this can also be adjusted by setting the `type` to `submit`.
			 * TODO: It's not really possible to hold SHIFT while pressing ENTER in iOS.
			 * @type {boolean}
			 */
			entershift: false,

			/**
			 * Setup on enter.
			 */
			onenter: function() {
				this.super.onenter();
				this.css.add(ts.ui.CLASS_TEXTAREA);
				this.event.add('input keydown');
				this._snapshot = this.element.value;
				this.tick.add(tick).start(tick, time);
				this.att.add('rows');
				this._autosize();
			},

			/**
			 * Handle attribute (change). In Angular, attributes change chaotically.
			 * @param {gui.Att} att
			 */
			onatt: function(att) {
				this.super.onatt(att);
				if (att.name === 'rows') {
					var val = att.value;
					if (Type.isNumber(val)) {
						// no weird Moustache template
						this.css.minHeight = UNIT * val;
						if (val >= 10) {
							this.css.maxHeight = UNIT * val;
						}
					}
				}
			},

			/**
			 * Handle event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				var was = this._suspendenterkey;
				switch (e.type) {
					case 'input':
						this.super.onevent(e);
						this._autosize();
						break;
					case 'keydown':
						if (e.keyCode === 13) {
							if (this.entershift || this.att.get('type') === 'submit') {
								if (e.shiftKey) {
									this._suspendenterkey = true;
								} else {
									e.preventDefault();
									var elm = this.element;
									if (elm.form) {
										elm.form.submit();
									}
									this.tick.next(function donteatevent() {
										if (document.activeElement === elm) {
											elm.blur();
										}
									});
								}
							}
						}
						this.super.onevent(e);
						this._suspendenterkey = was;
						break;
				}
			},

			/**
			 * Autosize whenever `textarea.value` was changed programatically.
			 * TODO: Account for scenario where textarea is in a `display:none`
			 * part of the screen...
			 * @param {gui.Tick} t
			 */
			ontick: function(t) {
				this.super.ontick(t);
				if (t.type === tick) {
					if (this.element.value !== this._snapshot) {
						this._snapshot = this.element.value;
						this._autosize();
					} else if (this.css.get('height') === 'auto') {
						/*
						 * Hotfix for TODO (in top of file): This is expensive, but there
						 * is no way for us to know if we started hidden and now we are
						 * shown (spirits have an API to manage this, but nobody knows).
						 * Perhaps some kind of transitioned property can be caught with
						 * `transitionend` so that we can get away with something nicer?
						 */
						this._autosize();
					}
				}
			},

			// Private .................................................................

			/**
			 * Setup the model (and unsetup any potential old model).
			 * @param {ts.ui.InputModel} model
			 * @param {boolean} setup Setup or unsetup?
			 */
			_setupmodel: function(model, setup) {
				this.super._setupmodel(model, setup);
				this.entershift = setup ? model.entershift : false;
			},

			/**
			 * Adjust height. Snap to line height. Abort in case we are display:none.
			 * If the height changed, dispatch action to any containing layout managers.
			 */
			_autosize: function() {
				var target,
					padding = UNIT * 0.5;
				var current = this.css.height || this.box.height;
				this.css.height = 'auto';
				if ((target = Math.floor(this.element.scrollHeight / UNIT) * UNIT) > 0) {
					this.css.height = target + padding;
					if (current !== target) {
						this._hotfixchrome(this.element);
						this.action.dispatch(ts.ui.ACTION_CHANGED, {
							oldheight: current,
							newheight: target
						});
					}
				}
			},

			/**
			 * Force repaint to fix a rendering dysfunction in newer versions
			 * of Google Chrome (appears not needed when the scrollbar is shown).
			 * @param {Element} elm
			 */
			_hotfixchrome: function(elm) {
				if (Client.isChrome && elm.scrollHeight <= elm.offsetHeight) {
					this.tick.nextFrame(function() {
						this.css.display = 'none';
						this.css.display = '';
					});
				}
			}
		},
		{
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @returns {ts.ui.TextAreaSpirit}
			 */
			summon: function() {
				return this.possess(document.createElement('textarea'));
			}
		}
	);
})(gui.Type, gui.Client, ts.ui.UNIT, ts.ui.FieldSpirit.TICK_SYNC, ts.ui.FieldSpirit.TICK_TIME);
