/**
 * Spirit of the Modal.
 * @using {ts.ui.ts.ui.ToolBarSpirit} ToolBarSpirit
 * @using {gui.Client} Client
 * @using {boolean} transition
 * @using {function} gui.Combo.chained
 */
ts.ui.ModalSpirit = (function using(ToolBarSpirit, Client, transition, chained) {
	var willopen = ts.ui.BROADCAST_MODAL_WILL_OPEN,
		didopen = ts.ui.BROADCAST_MODAL_DID_OPEN,
		willclose = ts.ui.BROADCAST_MODAL_WILL_CLOSE,
		didclose = ts.ui.BROADCAST_MODAL_DID_CLOSE;

	return ts.ui.Spirit.extend({

		/**
		 * Modal is open?
		 * @type {boolean}
		 */
		isOpen: false,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onopen: null,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onopened: null,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onclose: null,

		/**
		 * Open for implementation.
		 * @type {string|function}
		 */
		onclosed: null,

		/**
		 * Get ready.
		 */
		onready: function() {
			this.super.onready();
			this.dom.hide();
			this._setup(this._panel());
			this.css.shift(transition, 'ts-transition');
		},

		/**
		 * Open AND close the Modal (setup to support the
		 * HTML attribute: `data-ts.open="true|false"`)
		 * @param @optional {boolean} opt_open Omit to simply open
		 */
		open: function(opt_open) {
			var then = this._then = new gui.Then();
			opt_open = arguments.length ? opt_open : true;
			if (opt_open !== this.isOpen) {
				if (opt_open) {
					if (this._execute('onopen') && this._confirmposition()) {
						this.isOpen = true;
						this._fadeIn();
					}
				} else {
					if (this._execute('onclose')) {
						this.isOpen = false;
						this._fadeOut();
					}
				}
			}
			return then;
		},

		/**
		 * Close the Modal.
		 * @returns {gui.Then}
		 */
		close: function() {
			return this.open(false);
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			if (e.type === 'transitionend' && e.target === this.element) {
				this.event.remove(e.type);
				if (this.isOpen) {
					this._fadeIn(true);
				} else {
					this._fadeOut(true);
				}
			}
		},

		/**
		 * Handle key.
		 * @param {gui.Key} key
		 */
		onkey: function(key) {
			this.super.onkey(key);
			if (key.type === 'Esc') {
				this.close();
			}
		},

		/**
		 * Get or set the title.
		 * @param @optional {string} title
		 */
		title: chained(function(title) {
			var header = this._header();
			if (arguments.length) {
				header.title(title);
			} else {
				return header.title();
			}
		}),

		/**
		 * Get or set the buttons.
		 * @param @optional {Array<Object>} json
		 * @returns {ts.ui.ButtonsCollection|ts.ui.ModalSpirit}
		 */
		buttons: chained(function(json) {
			var footer = this._footer();
			if (arguments.length) {
				footer.buttons(json);
			} else {
				return footer.buttons();
			}
		}),

		/**
		 * Resize and reposition on startup and on `window.resize`.
		 * @overwrites {gui.Spirit#onflex}
		 * @param @optional {Function} callback
		 * @param @optional {Object} thisp
		 */
		onflex: function(callback, thisp) {
			var avail = window.innerHeight;
			if (!this._fullscreen) {
				this._autosize(avail).then(function(height, breaks) {
					this._position(height, avail, breaks);
					if (callback) {
						callback.call(thisp);
					}
				}, this);
			}
		},

		// Private .................................................................

		/**
		 * Open fullscreen?
		 * @type {boolean}
		 */
		_fullscreen: true,

		/**
		 * Promise-like object for intercepting fadeIn/fadeOut setup.
		 * @type {gui.Then}
		 */
		_then: null,

		/**
		 * Fade in (start and done).
		 * @param @optional {boolean} done Animation finished?
		 */
		_fadeIn: function(done) {
			if (done) {
				this.key.add('Esc');
				this.css.remove('ts-opening').add('ts-open');
				this._execute('onopened');
				this.broadcast.dispatch(didopen);
				this._then.now();
				this._focus();
			} else {
				this.dom.show();
				this._cloak(true);
				this.broadcast.dispatch(willopen);
				this.onflex(function() {
					this._cloak(false);
					if (transition) {
						this.css.add('ts-opening');
						this.event.add('transitionend');
					} else {
						this._fadeIn(true);
					}
				}, this);
			}
		},

		/**
		 * Fade out (start and done).
		 * @param @optional {boolean} done Animation finished?
		 */
		_fadeOut: function(done) {
			if (done) {
				this.dom.hide();
				this.css.remove('ts-closing');
				this._execute('onclosed');
				this.broadcast.dispatch(didclose);
				this._then.now();
			} else {
				this.key.remove('Esc');
				this.broadcast.dispatch(willclose);
				this.css.add('ts-closing').remove('ts-open');
				if (transition) {
					this.event.add('transitionend');
				} else {
					this._fadeOut(true);
				}
			}
		},

		/**
		 * On Modal opened, focus the first focusable thing
		 * (having allowed the dev to focus something first)
		 */
		_focus: function() {
			var focused = document.activeElement;
			if (!focused || !this.dom.contains(focused)) {
				this.attention.enter();
			}
		},

		/**
		 * @param {boolean} hidden
		 */
		_cloak: function(hidden) {
			this.css.visibility = hidden ? 'hidden' : 'visible';
		},

		/**
		 * @returns {gui.Then}
		 */
		_autosize: function(avail) {
			this.css.remove('ts-overflow');
			var then = new gui.Then();
			var height = this._panel().naturalHeight() +
				(this.css.contains('ts-hasheader') ? 66 : 0) +
				(this.css.contains('ts-hasheader') ? 66 : 0);
			var breaks = height > avail;
			height = breaks ? avail : height;
			this.css.height = height;
			this.css.shift(breaks, 'ts-overflow');
			this.tick.time(function unflicker() {
				then.now(height, breaks);
			}, Client.isWebKit ? 100 : 200);
			return then;
		},

		/**
		 * Position Modal in the center of the screen.
		 * TODO: Position in golden ratio (and account for exit via screen top).
		 * @param {number} height
		 * @param {number} avail
		 * @param {boolean} breaks
		 */
		_position: function(height, avail, breaks) {
			this.css.top = breaks ? 0 : 0.5 * (avail - height);
		},

		/**
		 * Confirm panel, setup the header.
		 * @param {ts.ui.PanelSpirit} panel
		 * @throws {Error}
		 */
		_setup: function(panel) {
			var that = this;
			if (panel) {
				this.attention.trap(panel);
				this._header().showClose(function() {
					that.open(false);
				});
			} else {
				throw new Error('Expected a ts-panel');
			}
		},

		/**
		 * Get spirit of the panel.
		 * @returns {ts.ui.PanelSpirit}
		 */
		_panel: function() {
			return this.dom.q('.ts-panel', ts.ui.PanelSpirit);
		},

		/**
		 * Get spirit of the header.
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_header: function() {
			var theToolBarSpirit = ts.ui.ToolBarSpirit; // TODO: Load this after!
			this.css.add('ts-hasheader');
			return this.dom.q('header.ts-toolbar', theToolBarSpirit) ||
				this.dom.prepend(theToolBarSpirit.summon('header', 'ts-bg-blue'));
		},

		/**
		 * Get spirit of the footer.
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_footer: function() {
			this.css.add('ts-hasfooter');
			var theToolBarSpirit = ts.ui.ToolBarSpirit; // TODO: Load this after!
			return this.dom.q('footer.ts-toolbar', theToolBarSpirit) ||
				this.dom.append(theToolBarSpirit.summon('footer'));
		},

		/**
		 * Confirm that we're not nested inside Main.
		 * @returns {boolean}
		 * @throws {Error}
		 */
		_confirmposition: function() {
			if (this.guilayout.outsideMain()) {
				return true;
			} else {
				throw new Error(
					this + ' must be positioned outside Main', this.element
				);
			}
		},

		/**
		 * Execute callback configured via HTML attribute or via JS property.
		 * The 'this' keyword points to the element or the spirit respectively.
		 * TODO (jmo@): convert potential string to function sometimes sooner...
		 * @type {String|function}
		 * @returns {boolean}
		 */
		_execute: function(callback) {
			if ((callback = this[callback])) {
				switch (gui.Type.of(callback)) {
					case 'string':
						return new Function(callback).call(this);
					case 'function':
						return callback.call(this);
				}
			}
			return true;
		}

	});
}(ts.ui.ToolBarSpirit, gui.Client, gui.Client.hasTransitions, gui.Combo.chained));
