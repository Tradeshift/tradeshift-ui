/**
 * Spirit of the Modal.
 * @using {gui.Client} Client
 * @using {boolean} transition
 * @using {function} gui.Combo.chained
 */
ts.ui.ModalSpirit = (function using(Client, transition, chained) {
	var willopen = ts.ui.BROADCAST_MODAL_WILL_OPEN,
		didopen = ts.ui.BROADCAST_MODAL_DID_OPEN,
		willclose = ts.ui.BROADCAST_MODAL_WILL_CLOSE,
		didclose = ts.ui.BROADCAST_MODAL_DID_CLOSE;

	return ts.ui.LayoutSpirit.extend({
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
			this.css.shift(transition, 'ts-transition');
		},

		/**
		 * Open AND close the Modal (setup to support the
		 * HTML attribute: `data-ts.open="true|false"`)
		 * @param @optional {boolean} opt_open Omit to simply open
		 */
		open: function(opt_open) {
			var then = (this._then = new gui.Then());
			if (!this._initialized) {
				this._setup(this._panel());
			}
			if (!this.doorman.open(opt_open)) {
				then.now(false); // TODO: such a good idea to return a "promise", then?
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
		 * Forwarding to the panel.
		 * @returns {this}
		 */
		busy: chained(function() {
			var panel = this._panel();
			panel.busy.apply(panel, arguments);
		}),

		/**
		 * Forwarding to the panel.
		 * @returns {this}
		 */
		done: chained(function() {
			var panel = this._panel();
			panel.done.apply(panel, arguments);
			this.reflex();
		}),

		/**
		 * @deprecated
		 * @returns {this}
		 */
		spin: chained(function(message) {
			console.error('The modal "spin" method id deprecated. Use "busy" instead');
			this.busy.apply(this, arguments);
		}),

		/**
		 * @deprecated
		 * @returns {this}
		 */
		stop: chained(function() {
			console.error('The modal "stop" method id deprecated. Use "done" instead');
			this.done();
		}),

		/**
		 * Get the footer
		 * @returns {ts.ui.FooterBarSpirit}
		 */
		footer: chained(function() {
			return this._foot();
		}),

		/**
		 * Get the header
		 * @returns {ts.ui.HeaderBarSpirit}
		 */
		header: chained(function() {
			return this._head();
		}),

		/**
		 * Inject HTML into the Main or Panel (that
		 * is currently selected, in case of tabs).
		 * This serves an example in the Docs, mostly.
		 * @param @optional {string} markup
		 * @returns {string|this}
		 */
		html: chained(function(markup) {
			var target = this._box() || this._panel();
			if (arguments.length) {
				target.dom.html(markup);
			} else {
				return target.dom.html();
			}
		}),

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
		 * If a dialog is open, the Esc will dismiss the dialog first
		 */
		onkey: function(key) {
			this.super.onkey(key);
			if (key.down && key.type === 'Esc') {
				var hasOpenDialog = document.querySelector(
					'div.ts-open[data-ts-spirit="ts.ui.DialogSpirit"]'
				);
				if (!hasOpenDialog) {
					this.close();
				}
			}
		},

		/**
		 * Get or set the title.
		 * @param @optional {string} title
		 * @returns {String|this}
		 */
		title: chained(function(title) {
			var header = this._head();
			if (arguments.length) {
				header.title(title);
			} else {
				return header.title();
			}
		}),

		/**
		 * Get or set the statusbar message.
		 * @param @optional {string} message
		 * @returns {String|this}
		 */
		status: chained(function(message) {
			var footer = this._foot();
			if (arguments.length) {
				footer.message(message);
			} else {
				return footer.message();
			}
		}),

		/**
		 * Get or set the statusbar Pager.
		 * @param @optional {Object} json
		 * @returns {ts.ui.PageModel|this}
		 */
		pager: chained(function(json) {
			var footer = this._foot();
			if (arguments.length) {
				footer.pager(json);
			} else {
				return footer.pager();
			}
		}),

		/**
		 * Unlike in a standard {BoxSpirit}, buttons go into the footer!
		 * @param @optional {Array<Object>} json
		 * @returns {ts.ui.ButtonsCollection|this}
		 */
		buttons: chained(function(json) {
			var footer = this._foot();
			if (arguments.length) {
				footer.buttons(json);
			} else {
				return footer.buttons();
			}
		}),

		/**
		 * Resize and reposition on startup and on `window.resize`.
		 * TODO: Less JS, more CSS!
		 * @overwrites {gui.Spirit#onflex}
		 * @param @optional {Function} callback
		 * @param @optional {Object} thisp
		 */
		onflex: function(callback, thisp) {},

		// Privileged ..............................................................

		/**
		 * Called by the {DoorManPlugin} when the modal opens.
		 */
		$onopen: function() {
			this.css.add('ts-fullscreen').add('ts-overflow');
			this._fadeIn();
		},

		/**
		 * Called by the {DoorManPlugin}.
		 */
		$onclose: function() {
			this._fadeOut();
		},

		/**
		 * Called by the {ts.ui.PanelsPlugin} when a tab is selected.
		 * @param {ts.ui.TabPanel} panel The corresponding panel
		 */
		$selectTab: function(panel) {
			this.super.$selectTab(panel);
			this._focus(panel);
		},

		// Private .................................................................

		/**
		 * Promise-like object for intercepting fadeIn/fadeOut setup.
		 * @type {gui.Then}
		 */
		_then: null,

		/**
		 * Get the Panel (or the currently selected Panel, in case of tabs).
		 * @returns {ts.ui.PanelSpirit}
		 */
		_panel: function() {
			return this.dom.child(ts.ui.PanelSpirit) || this.dom.child(ts.ui.PanelsSpirit).current();
		},

		/**
		 * Get the Box (used for centering the content), if any. We'll also look for
		 * the Main, even if this is not deprecated. TODO: Remove at some point...
		 * @param {ts.ui.PanelSpirit} panel
		 */
		_box: function(panel) {
			return (
				(panel || this._panel()).dom.child(ts.ui.BoxSpirit) || // the new standard!
				(panel || this._panel()).dom.child(ts.ui.MainSpirit) // deprecated standard
			);
		},

		/**
		 * Fade in (start and done).
		 * @param @optional {boolean} done Animation finished?
		 */
		_fadeIn: function(done) {
			if (done) {
				this.key.add('Esc');
				this.css.remove('ts-opening').add('ts-open');
				this.broadcast.dispatch(didopen);
				this._then.now(true);
				this.doorman.didopen();
				this._focus(this._panel());
			} else {
				// fade in start
				this._addCover();
				this.dom.show();
				this.reflex();
				this._cloak(true);
				this.broadcast.dispatch(willopen);
				this.att.set('data-ts.open', true);
				if (this.dom.tag() === 'dialog') {
					this.att.set('open', 'open');
				}
				this.onflex();
				this.tick.time(function stabilize() {
					this._cloak(false);
					if (transition) {
						this.css.add('ts-opening');
						this.event.add('transitionend');
					} else {
						this._fadeIn(true);
					}
				}, 25);
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
				this.broadcast.dispatch(didclose);
				this.att.set('data-ts.open', false);
				if (this.dom.tag() === 'dialog') {
					this.att.del('open');
				}
				this._then.now();
				this.tick.time(function() {
					if (!this.$disposed) {
						(this._box() || this).attention.exit();
						this.doorman.didclose();
					}
				});
			} else {
				// fade out start
				this._removeCover();
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

		_addCover: function() {
			var self = this;
			var cover = document.createElement('div');
			cover.classList.add('ts-modal-cover');
			document.body.appendChild(cover);
			cover.classList.add(ts.ui.CLASS_VISIBLE);

			cover.addEventListener('click', function() {
				self.close();
			});
		},

		_removeCover: function() {
			var cover = document.querySelector('.ts-modal-cover');
			cover.classList.remove(ts.ui.CLASS_VISIBLE);
			window.setTimeout(function() {
				cover.parentNode.removeChild(cover);
			}, 500);
		},

		/**
		 * On Modal opened, focus the first focusable thing
		 * (having allowed the dev to focus something first)
		 * @param {ts.ui.PanelSpirit} panel
		 */
		_focus: function(panel) {
			var focus = document.activeElement;
			if (!focus || !panel.dom.contains(focus)) {
				(this._box() || this).attention.enter();
			}
		},

		/**
		 * @param {boolean} hidden
		 */
		_cloak: function(hidden) {
			this.css.visibility = hidden ? 'hidden' : 'visible';
		},

		/**
		 * Size the Modal just before we show it.
		 * @param {number} avail
		 * @param {number} xxxxx
		 * @returns {gui.Then}
		 *
		_autosize: function(avail, xxxxx) {
			var then = new gui.Then();
			this._autosizefullscreen(then, avail, xxxxx);
			return then;
		},
		*/

		/**
		 * Size the modal to fill the screen, obviously.
		 * @param {gui.Then} then
		 * @param {number} avail
		 * @param {number} xxxxx
		 *
		_autosizefullscreen: function(then, avail, xxxxx) {
			this.css.height = avail;
			this.css.width = xxxxx;
			this._autocenter(this._panel());
			this.tick.time(function unflicker() {
				then.now(avail, false);
			}, Client.isWebKit ? 50 : 100);
		},
		*/

		/**
		 * Center main in panel. You are probably thinking that some CSS can replace 
		 * this nowadays, but we don't really want the Main to *stay* centered 
		 * when you append more content to it (since that will move it incrementally 
		 * upwards on the screen) so the JS layout  solution may still be alright.
		 * Remove by leo, replace some JS layout with pure CSS for performance success. 
		 * @param {ts.ui.PanelSpirit} panel

		_autocenter: function(panel) {
			var box = this._box(panel);
			var POS = 0.382;
			if (box) {
				var height = box.box.height;
				var avails = panel.box.height;
				var offset = avails * POS - height * 0.5;
				box.css.top = offset > 0 ? offset : 0;
			}
		},
		*/

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
				this._head().closebutton(function() {
					that.open(false);
				});
				this._initialized = true;
			} else if (!Client.isExplorer) {
				throw new Error('Expected a ts-panel');
			}
		},

		/**
		 * Get spirit of the header.
		 * @overwrites {ts.ui.LayoutSpirit#_head}
		 * @returns {ts.ui.HeaderBarSpirit}
		 */
		_head: function() {
			return ts.ui.LayoutSpirit.macroHeader(this);
		},

		/**
		 * Get spirit of the footer.
		 * @returns {ts.ui.FooterBarSpirit}
		 */
		_foot: function() {
			return ts.ui.LayoutSpirit.macroFooter(this);
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
				throw new Error(this + ' must be positioned outside Main', this.element);
			}
		}
	});
})(gui.Client, gui.Client.hasTransitions, gui.Combo.chained);
