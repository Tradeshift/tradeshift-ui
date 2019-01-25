/**
 * Spirit of the dialog.
 * @extends {ts.ui.Spirit}
 * @using {ts.ui.Note} Note
 * @using {gui.Type} Type
 * @using {gui.Client} Client
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} confirmed
 * TODO: Make sure that Note text never collides with Note buttons (mobile)!
 * TODO: use css for icon shit instead of crappy JS (still relevant?)
 */
ts.ui.NoteSpirit = (function using(Note, Type, Client, chained, confirmed) {
	var CLASS_CLOSING = ts.ui.CLASS_CLOSING;
	var CLASS_CLOSED = ts.ui.CLASS_CLOSED;
	var CLASS_HAS_CLOSE = 'ts-has-close';
	var CLASS_CLOSE_ICON = 'ts-icon-close';
	var CLASS_CLOSE_BUTTON = 'ts-note-close';
	var CLASS_HIDDEN = ts.ui.CLASS_HIDDEN;

	return ts.ui.Spirit.extend(
		{
			/**
			 * Is the Note closing?
			 * @type {gui.Then|null}
			 */
			_closing: null,
			/**
			 * The previous visibility state
			 * @type {boolean|null}
			 */
			_prevIsVisible: null,

			/**
			 * Load edbml if we have a model.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				if (this._ismodelled()) {
					this.action.add(ts.ui.ACTION_SAFE_LINK);
					this.script.load(ts.ui.NoteSpirit.edbml);
					this.script.input(this._model);
					this._model.addObserver(this);
				}
			},

			/**
			 * Make background yellow & adjust container height if page-level Note.
			 */
			onready: function() {
				this.super.onready();
				this._adjustVisible();
			},

			/**
			 * Adjust container height if page-level Note if values change.
			 */
			onrender: function() {
				this.super.onrender();
				this._adjustVisible();
			},

			/**
			 * Handle closing transition event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				switch (e.type) {
					case 'transitionend':
						if (this._closing) {
							this._closing.now();
							this._closing = null;
						}
						break;
					case 'click':
						this.$close();
						gui.Tick.time(
							function() {
								this.css.add(CLASS_HIDDEN);
							},
							50,
							this
						);

						break;
				}
			},

			/**
			 * Handle action.
			 * @param {gui.Action} a
			 */
			onaction: function(a) {
				this.super.onaction(a);
				if (a.type === ts.ui.ACTION_SAFE_LINK && this._ismodelled()) {
					if (Type.isFunction(this._model.onlink)) {
						this._model.onlink.call(this._model, a.data);
					}
					a.consume();
				}
			},

			/**
			 * Handle (model) changes.
			 * @param {Array<edb.Change>} changes
			 */
			onchange: function(changes) {
				this.super.onchange(changes);
				changes.forEach(function(c) {
					if (c.object === this._model && c.name === 'open' && !c.newValue) {
						this.close();
					}
				}, this);
			},

			/**
			 * Make it closeable.
			 * @param {boolean} closeable
			 */
			closeable: function(closeable) {
				if (closeable) {
					var button = this.dom.prepend(
						ts.ui.ButtonSpirit.summon(document, { icon: CLASS_CLOSE_ICON })
					);
					this.css.add(CLASS_HAS_CLOSE);
					button.css.add(CLASS_CLOSE_BUTTON);
					button.event.add('click', button, this);
				}
			},

			/**
			 * Support alternative spelling (since none is more correct).
			 * @alias {ts.ui.NoteSpirit#closable}
			 */
			closable: function() {
				return this.closeable.apply(arguments);
			},

			/**
			 * Set icon.
			 * icon-class: gui.CSSPlugin.add(i, classname);
			 * @param {String} classname
			 */
			icon: chained(function(classname) {
				var i = this.dom.q('i') || this.dom.prepend(document.createElement('i'));
				i.className = classname;
				this._adjustVisible();
			}),

			/**
			 * Set text.
			 * @param {String} text
			 */
			text: chained(function(text) {
				var p = this.dom.q('p') || this.dom.append(document.createElement('p'));
				p.textContent = text;
				this._adjustVisible();
			}),

			/**
			 * Close Note.
			 * @returns {ts.ui.NoteSpirit}
			 */
			close: chained(function() {
				this.$close().then(function() {
					if (gui.Type.isFunction(this._model.onclose)) {
						this._model.onclose();
					}
					this._adjustPage(true);
					this._model.removeObserver(this);
					this._model.dispose();
					if (this._model === ts.ui.Note._model) {
						ts.ui.Note._model = null;
					}
					this._model = null;
					this.dom.remove();
				}, this);
			}),

			/**
			 * Get or set the buttons.
			 * @param @optional {Array<object>} opt_json
			 * @returns {ts.ui.ButtonCollection|ts.ui.ToolBarSpirit}
			 */
			buttons: confirmed('(array)')(
				chained(function(opt_json) {
					var buttons = this.model().buttons;
					if (arguments.length) {
						buttons.clear(); // reusing the collection to preserve observers
						opt_json.forEach(function(json) {
							buttons.push(json);
						});
					} else {
						return buttons;
					}
				})
			),

			// Private .................................................................

			/**
			 * Adjust Note visibility.
			 * @private
			 */
			_adjustVisible: function() {
				if (this._ismodelled() && this._model.onclose) {
					this.css.add(CLASS_HAS_CLOSE);
				} else {
					this.css.remove(CLASS_HAS_CLOSE);
				}
				if (
					(!!this.dom.q('p') && !!this.dom.q('p').textContent) ||
					(!!this.dom.q('i') && !!this.dom.q('i').className) ||
					!!this.dom.q('.ts-note-buttons')
				) {
					this.dom.show();
					if (!this._prevIsVisible) {
						this._adjustPage();
					}
					this._prevIsVisible = true;
					this._adjustContentPadding();
				} else {
					if (this._prevIsVisible) {
						this._adjustPage(true);
					}
					this._prevIsVisible = false;
					this.dom.hide();
				}
			},

			/**
			 * adjust the <p> padding right when the note has buttons.
			 * @private
			 */
			_adjustContentPadding: function() {
				var buttons = this.dom.q('.ts-note-buttons');
				var para = this.dom.q('p');
				if (buttons && para) {
					para.style.paddingRight = buttons.offsetWidth + 'px';
				}
			},

			/**
			 * Add mainContent margin and adjust scrolling.
			 * @param {boolean=} isRemove
			 * @private
			 */
			_adjustPage: function(isRemove) {
				if (this._ismodelled() && this._model.$isTopNote) {
					var height = isRemove ? 0 : this.box.height;
					var mainContentElement = document.querySelector('.ts-content');
					mainContentElement.spirit.css.marginTop = height;
					ts.ui.get(document.documentElement).reflex();
				}
			},

			// Privileged .................................................................

			/**
			 * Start closing transition.
			 * @returns {gui.Then|null}
			 */
			$close: function() {
				if (!this._closing) {
					this._closing = new gui.Then();
					this.event.add('transitionend');
					this.css.add(CLASS_CLOSING);
					gui.Tick.time(
						function() {
							this.css.add(CLASS_CLOSED);
						},
						0,
						this
					);
				}
				return this._closing;
			}
		},
		{
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @param {ts.ui.NoteModel=} opt_model
			 * @return {ts.ui.NoteSpirit}
			 */
			summon: function(opt_model) {
				var spirit = this.possess(document.createElement('div'));
				spirit._model = opt_model || null;
				return spirit;
			}
		}
	);
})(ts.ui.Note, gui.Type, gui.Client, gui.Combo.chained, gui.Arguments.confirmed);
