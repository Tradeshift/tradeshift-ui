/**
 * Spirit of the button AND link.
 *
 * TODO: ALWAYS APPLY `ts-active` ON TOUCH DEVICE!
 *
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 * @using {gui.Client} Client
 * @using {gui.Type} Type
 * @using {gui.CSSPlugin} CSSPlugin
 */
ts.ui.ButtonSpirit = (function using(chained, Client, Type, CSSPlugin) {
	// classnames reserved for button color scheme
	var classnames = [
		ts.ui.CLASS_PRIMARY,
		ts.ui.CLASS_SECONDARY,
		ts.ui.CLASS_TERTIARY,
		ts.ui.CLASS_DANGER
	];

	// some other classnames
	var CLASS_READY = ts.ui.CLASS_READY;
	var CLASS_LOADING = ts.ui.CLASS_IS_LOADING;
	var CLASS_LOADING_MESSAGE = 'ts-loading-message';

	return ts.ui.Spirit.extend(
		{
			/**
			 * Action type. This may be set in the markup:
			 * <button data-ts.type="myactiontype"></button>
			 * If not set, we fallback to default action.
			 * @type {String}
			 */
			type: null,

			/**
			 * Action data. This may be set in the markup:
			 * <button data-ts.data="myactiondata"></button>
			 * If not set, we fallback to default data.
			 * @type {objectg}
			 */
			data: null,

			/**
			 * Mark as busy or done, use `false` or empty string when done.
			 * (API looks like this so we can control it via HTML attribute)
			 * TODO: Support boolean arg here (for parity with elsewhere)
			 * @param @optional {string|boolean} busy
			 * @returns {ts.ui.ButtonSpirit}
			 */
			busy: chained(function(busy) {
				busy = arguments.length ? busy : true;
				var css = this.css;
				if (Type.isString(busy) && busy.trim().startsWith('{')) {
					return; // about weird Moustache syntax (Angular scenario)
				}
				if (busy) {
					this._busymessage(busy);
					css.remove(CLASS_READY).add(CLASS_LOADING);
				} else if (css.contains(CLASS_LOADING)) {
					css.remove(CLASS_LOADING);
					this._nomorebusy(function bypasstransitions() {
						css.shift(!css.contains(CLASS_LOADING), CLASS_READY);
					});
				}
			}),

			/**
			 * Mark as done.
			 * @returns {ts.ui.ButtonSpirit}
			 */
			done: chained(function() {
				this.busy(false);
			}),

			/**
			 * By setting the `href` property with JavaScript
			 * instead of HTML, Neal says we are more secure.
			 * See also https://dev.to/ben/the-targetblank-vulnerability-by-example
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.att.add('tabindex');
				this.event.add('click dragstart');
				if (!Client.isTouchDevice) {
					this.event.add('mousedown focus blur');
				}
				if (this.type === ts.ui.ACTION_SAFE_LINK && this.data) {
					if (/^http(s?):\/\//.test(this.data)) {
						this.element.target = '_blank';
						this.element.rel = 'noopener';
						this.element.href = this.data;
					}
				}
			},

			/**
			 * Setup on enter.
			 */
			onenter: function() {
				this.super.onenter();
				var elm = this.element;
				this._keyboardclass();
				this._defaultclass(this.element.parentNode.parentNode);
				this._defaulttype(elm.localName, this.att.get('type'), this.att.get('href'));
			},

			/**
			 * Add the classname to transition colors *after* a very short break
			 * so that the colors don't transition strangely on initial page load.
			 * There should probably be (or there is?) a CSS strategy for this.
			 */
			onasync: function() {
				this.super.onasync();
				this.css.add(CLASS_READY);
			},

			/**
			 * Handle attribute.
			 * @param {gui.Att} a
			 */
			onatt: function(a) {
				this.super.onatt(a);
				if (a.name === 'tabindex') {
					this._keyboardclass(a.value);
				}
			},

			/**
			 * Handle event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				var busy = this.css.contains(CLASS_LOADING);
				switch (e.type) {
					case 'mousedown':
						if (!busy) {
							this._depressing = true;
							this.tick.time(function() {
								this._depressing = false;
							});
						}
						break;
					case 'focus':
						this._focusclass(true, !this._depressing);
						break;
					case 'blur':
						this._focusclass(false);
						break;
					case 'click':
						if (!busy) {
							this._depressing = false;
							this._dispatchaction();
							this._focusclass(true, true);
						}
						break;
					case 'dragstart':
						e.preventDefault();
						break;
				}
			},

			/**
			 * Set icon.
			 * TODO (jmo@): Use "add" but remove existing
			 * icon-class: gui.CSSPlugin.add ( i, classname);
			 * @param {String} classname
			 * @return {ts.ui.ButtonSpirit}
			 */
			icon: chained(function(classname) {
				var i = this.dom.q('i') || this.dom.append(document.createElement('i'));
				i.className = classname;
			}),

			/**
			 * Set ot get text.
			 * @param @optional {string} classname
			 * @return {string|ts.ui.ButtonSpirit}
			 */
			text: chained(function(text) {
				var span = this.dom.q('span');
				if (arguments.length) {
					span = span || this.dom.append(document.createElement('span'));
					span.textContent = text;
				} else {
					return span ? span.textContent : null;
				}
			}),

			/**
			 * Disable the button.
			 * @returns {ts.ui.ButtonSpirit}
			 */
			disable: chained(function() {
				this.element.disabled = true;
			}),

			/**
			 * Enable the button.
			 * @returns {ts.ui.ButtonSpirit}
			 */
			enable: chained(function() {
				this.element.disabled = false;
			}),

			// Private .................................................................

			/**
			 * Used to track button handling in order to support the following:
			 * First time the button is clicked, we flash the :focus appearance.
			 * Next time the button is clicked, we flash the :active appearance.
			 * (it flashed a bit too much when we applied both at the same time).
			 * @type {boolean}
			 */
			_depressing: false,

			/**
			 * When showing a temporary busy-message,
			 * snapshot the original label text here.
			 * @type {string}
			 */
			_donelabel: null,

			/**
			 * Default button type to "button" so that
			 * it won't accidentally submit forms.
			 * @param {string} name
			 * @param {string} type
			 */
			_defaulttype: function(name, type, href) {
				if (name === 'button' && !type) {
					this.element.type = 'button';
				} else if (name === 'a' && !href) {
					this.element.href = ts.ui.ButtonSpirit.HREF_DEFAULT;
				}
			},

			/**
			 * Default to "ts-tertiary" buttons inside Buttons (menu). Doing this
			 * in CSS would make the rules hard to read (and overwrite in apps).
			 * @param {Element} ancestor
			 */
			_defaultclass: function(ancestor) {
				if (ancestor && CSSPlugin.contains(ancestor, 'ts-buttons')) {
					if (
						!classnames.some(function(name) {
							return this.css.contains(name);
						}, this)
					) {
						this.css.add(ts.ui.CLASS_TERTIARY);
					}
				}
			},

			/**
			 * Buttons with a negative tabindex should not get focus styling
			 * and we enforce this by switching *direct* to the active styling.
			 * We could in theory do this in CSS using a `:not([tabindex=-1]`
			 * qualifier, but that would perhaps not look quite right. Note
			 * that touch devices will go directly to the active styling and
			 * so will *desktop Safari* because keyboard navigation via TAB
			 * is now disabled by default in Safari, probably this was done
			 * by the same loser who removed the scrollbars.
			 * @param {number} i This buttons tabindex
			 */
			_keyboardclass: function() {
				var ok = ts.ui.ButtonSpirit.hasfocusstyling && this._isfocusable();
				this.css.shift(!ok, 'ts-active').shift(!ok, 'ts-nofocus');
			},

			/**
			 * Can be focused with the keyboard? Note that buttons in the
			 * TopBar cannot be used with keyboard until we can find the
			 * proper time to open that particular can of worms.
			 * @returns {boolean}
			 */
			_isfocusable: function() {
				return this.element.tabIndex >= 0;
			},

			/**
			 * Spirit attached to a LINK that leads to somewhere?
			 * TODO (jmo@): Mount in gui.URL and test for outbound href.
			 * @return {boolean}
			 */
			_isnavigatable: function() {
				var elm = this.element,
					href = elm.href;
				return href && !href.startsWith('javascript:') && !elm.download;
			},

			/**
			 * When first clicked, the button will get the focus-styling. When
			 * clicked again, we'll deploy the active-styling. Too much stuff
			 * seemed to happen when we applied both styles at the same time.
			 * @param {boolean} is Focused? Otherwise blurred.
			 * @param @optional {boolean} keyboard Is most likely focused via keyboard?
			 */
			_focusclass: function(is, keyboard) {
				var css = 'ts-active';
				if (this._isfocusable()) {
					if (is) {
						if (keyboard) {
							this.css.add(css);
						}
					} else {
						this.css.remove(css);
					}
				}
			},

			/**
			 * Dispatch configured or default action.
			 */
			_dispatchaction: function() {
				this.action.dispatch(this.type || ts.ui.ACTION_CLICK, this.data);
			},

			/**
			 * Perhaps show a status message when busy?
			 * @param @optional {string|boolean} message
			 */
			_busymessage: function(message) {
				if (Type.isString(message)) {
					this.css.add(CLASS_LOADING_MESSAGE);
					this._donelabel = this.text();
					this.text(message);
				}
			},

			/**
			 * Restore original label and revert to normal
			 * button without any strange CSS transitions.
			 * @param {function} done
			 */
			_nomorebusy: function(cb) {
				if (this._donelabel) {
					this.css.remove(CLASS_LOADING_MESSAGE);
					this.text(this._donelabel);
					this._donelabel = null;
				}
				this.tick.time(function nocolortransition() {
					if (!this.$destructed) {
						cb.call(this);
					}
				}, 50);
			}
		},
		{
			// Static ...............................................................

			/**
			 * Focused-styling not working out alright for links without a href.
			 * @type {string}
			 */
			HREF_DEFAULT: 'javascript:void(false);',

			/**
			 * Summon spirit.
			 * @param {Document} doc TODO deprecate this arg...
			 * @param {Map<String,object>} config
			 */
			summon: function(doc, config) {
				var spirit = this.possess(doc.createElement('button'));
				if (config) {
					gui.Object.each(config, function(key, value) {
						switch (key) {
							case 'type':
								spirit.type = value;
								break;
							case 'data':
								spirit.data = value;
								break;
							case 'icon':
								spirit.icon(value);
								break;
						}
					});
				}
				return spirit;
			},

			/**
			 * If a button or something inside a button was clicked,
			 * return that button. When IE9 dies, we should make
			 * everything inside buttons `pointer-events:none`.
			 * Note that, confusingly, Firefox does this by default.
			 * @param {Element} elm
			 * @param @optional (Element) stop
			 * @returns {HTMLButtonElement}
			 */
			getButton: function(elm, stop) {
				while (elm.localName !== 'button' && (elm = elm.parentNode)) {
					if (stop && elm === stop) {
						return null;
					}
				}
				return elm;
			},

			/**
			 * See notes above.
			 * @param {Element} elm
			 * @param @optional (Element) stop
			 * @returns {Spirit}
			 */
			getSpirit: function(elm, stop) {
				elm = this.getbutton(elm, stop);
				return elm ? ts.ui.get(elm) : null;
			}
		},
		{
			// Static ...............................................................

			/**
			 * Buttons should show the focus styling on first click
			 * and then show active styling on subsequenct clicking?
			 * This assuming the the buttons are focusable, of course.
			 * @type {boolean}
			 */
			hasfocusstyling: !Client.isSafari && !Client.isTouchDevice
		}
	);
})(gui.Combo.chained, gui.Client, gui.Type, gui.CSSPlugin);
