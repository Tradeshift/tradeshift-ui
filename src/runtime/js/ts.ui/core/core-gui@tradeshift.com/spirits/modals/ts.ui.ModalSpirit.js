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
			this.css.shift(transition, 'ts-transition');
		},

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			switch (a.type) {
				case ts.ui.ACTION_STATUSBAR_LEVEL:
					this.guilayout.gotoLevel(a.data);
					this.reflex();
					break;
			}
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
		 * Cloak the content (to obscure whatever messy Angular loading sequence).
		 * @param @optional {string} message
		 */
		busy: chained(function() {
			this._panel().busy();
		}),

		/**
		 * Show the content once again.
		 */
		done: chained(function() {
			this.reflex();
			this._panel().done();
		}),

		/**
		 * Show a spinner while hiding the content, for mobiles and slow servers.
		 * @param @optional {string} message
		 */
		spin: chained(function(message) {
			this._panel().spin(message);
			this.busy();
		}),

		/**
		 * Stop the spinner and show the content.
		 */
		stop: chained(function() {
			this._panel().stop();
			this.done();
		}),

		/**
		 * Inject HTML into the Main or Panel (that
		 * is currently selected, in case of tabs).
		 * This serves an example in the Docs, mostly.
		 * @param @optional {string} markup
		 * @returns {string|ts.ui.ModalSpirit}
		 */
		html: chained(function(markup) {
			var target = this._main() || this._panel();
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
		 * @returns {String|ts.ui.ModalSpirit}
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
		 * Get or set the statusbar message.
		 * @param @optional {string} message
		 * @returns {String|ts.ui.ModalSpirit}
		 */
		status: chained(function(message) {
			var footer = this._footer();
			if (arguments.length) {
				footer.message(message);
			} else {
				return footer.message();
			}
		}),

		/**
		 * Get or set the statusbar Pager.
		 * @param @optional {Object} json
		 * @returns {ts.ui.PageModel|ts.ui.ModalSpirit}
		 */
		pager: chained(function(json) {
			var footer = this._footer();
			if (arguments.length) {
				footer.pager(json);
			} else {
				return footer.pager();
			}
		}),

		/**
		 * Get or set the tabs.
		 * @param @optional {Array<Object>} json
		 * @returns {Array<ts.ui.TabModel>|ts.ui.ModalSpirit}
		 */
		tabs: chained(function(json) {
			var tabbar = this._tabbar();
			if (arguments.length) {
				tabbar.tabs(json);
			} else {
				return tabbar.tabs();
			}
		}),

		/**
		 * Get or set the buttons in the statusbar.
		 * so will simply not allow that.
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
			var xxxxx = window.innerWidth;
			this._autosize(avail, xxxxx).then(function(height, breaks) {
				this._position(height, avail, breaks);
				if (callback) {
					callback.call(thisp);
				}
			}, this);
		},

		// Privileged ..............................................................

		/**
		 * Called by the {DoorManPlugin} when the modal opens.
		 */
		$onopen: function() {
			this.css
				.shift(this.$fullscreen, 'ts-fullscreen')
				.shift(!this.$fullscreen, 'ts-inscreen')
				.shift(this.$fullscreen, 'ts-overflow');
			this._fadeIn();
		},

		/**
		 * Called by the {DoorManPlugin}.
		 */
		$onclose: function() {
			this._fadeOut();
		},

		/**
		 * Open fullscreen? We can just hardcode this for now.
		 * @type {boolean}
		 */
		$fullscreen: true,

		/**
		 * Called by the {ts.ui.PanelsPlugin} to append a tab.
		 * @param {Object} json
		 * @param {number} index
		 */
		$insertTab: function(json, index) {
			var tabs = this._tabbar().tabs();
			if (this.$fullscreen) {
				tabs.splice(index, 0, json);
			} else {
				throw new Error('Tabs reserved for fullscreen modals :/');
			}
		},

		/**
		 * Called by the {ts.ui.PanelsPlugin} when a tab is selected.
		 * @param {ts.ui.TabPanel} panel The corresponding panel
		 */
		$selectTab: function(panel) {
			this._autocenter();
			this._focus();
		},

		// Private .................................................................

		/**
		 * Promise-like object for intercepting fadeIn/fadeOut setup.
		 * @type {gui.Then}
		 */
		_then: null,

		/**
		 * Get the Panel (currently selected, in case of tabs).
		 * @returns {ts.ui.PanelSpirit}
		 */
		_panel: function() {
			return this.panels.current();
		},

		/**
		 * Get the Main, if any (in the currently selected Panel, in case of tabs).
		 */
		_main: function() {
			return this._panel().childMain();
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
				this._focus();
			} else {
				this.dom.show();
				this.panels.init();
				this._cloak(true);
				this.broadcast.dispatch(willopen);
				this.att.set('data-ts.open', true);
				if (this.dom.tag() === 'dialog') {
					this.att.set('open', 'open');
				}
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
				this.broadcast.dispatch(didclose);
				this.att.set('data-ts.open', false);
				if (this.dom.tag() === 'dialog') {
					this.att.del('open');
				}
				this._then.now();
				this.tick.time(function() {
					if (!this.$disposed) {
						(this._main() || this).attention.exit();
						this.doorman.didclose();
					}
				});
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
			var panel = this._panel();
			var focus = document.activeElement;
			if (!focus || !panel.dom.contains(focus)) {
				(this._main() || this).attention.enter();
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
		 */
		_autosize: function(avail, xxxxx) {
			var then = new gui.Then();
			if (this.$fullscreen) {
				this._autosizefullscreen(then, avail, xxxxx);
			} else {
				this._autosizeinscreen(then, avail, xxxxx);
			}
			return then;
		},

		/**
		 * Size the modal to fill the screen, obviously.
		 * TODO: We might get away with pure CSS for this.
		 * @param {gui.Then} then
		 * @param {number} avail
		 * @param {number} xxxxx
		 */
		_autosizefullscreen: function(then, avail, xxxxx) {
			this.css.height = avail;
			this.css.width = xxxxx;
			this._autocenter();
			this.tick.time(function unflicker() {
				then.now(avail, false);
			}, Client.isWebKit ? 100 : 200);
		},

		/**
		 * Center main in panel.
		 * @param {ts.ui.MainSpirit} main
		 * @param {ts.ui.PanelSpirit} panel
		 */
		_autocenter: function() {
			var GOLDEN = 0.382;
			var panel = this._panel();
			var main = panel.childMain();
			if (main) {
				var height = main.box.height;
				var avails = panel.box.height;
				var offset = avails * GOLDEN - height * 0.5;
				main.css.top = offset > 0 ? offset : 0;
			}
		},

		/**
		 * If we should ever need non-fullscreen Modals,
		 * this will position the Modal centered on screen.
		 * @param {gui.Then} then
		 * @param {number} avail
		 * @param {number} xxxxx
		 */
		_autosizeinscreen: function(then, avail, xxxxx) {
			this.css.remove('ts-overflow');
			var height =
				this._panel().naturalHeight() +
				(this.css.contains('ts-hasheader') ? 66 : 0) +
				(this.css.contains('ts-hasheader') ? 66 : 0);
			var breaks = height > avail;
			height = breaks ? avail : height;
			this.css.height = height;
			this.css.shift(breaks, 'ts-overflow');
			this.tick.time(function unflicker() {
				then.now(height, breaks);
			}, Client.isWebKit ? 100 : 200);
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
				this._initialized = true;
			} else if (!Client.isExplorer) {
				throw new Error('Expected a ts-panel');
			}
		},

		/**
		 * Get spirit of the header (titlebar).
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_header: function() {
			var ToolBar = ts.ui.ToolBarSpirit;
			this.css.add('ts-hasheader');
			return (
				this.dom.q('header.ts-toolbar', ToolBar) ||
				this.dom.prepend(ToolBar.summon('header', 'ts-bg-blue'))
			);
		},

		/**
		 * Get spirit of the tabbar.
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_tabbar: function() {
			var TabBar = ts.ui.TabBarSpirit;
			this.css.add('ts-hastabs');
			return (
				this.dom.q('header.ts-tabbar', TabBar) ||
				this._header().dom.after(TabBar.summon('header', 'ts-bg-white'))
			);
		},

		/**
		 * Get spirit of the footer.
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_footer: function() {
			this.css.add('ts-hasfooter');
			var StatusBar = ts.ui.StatusBarSpirit;
			this.action.add(ts.ui.ACTION_STATUSBAR_LEVEL);
			return (
				this.dom.q('footer.ts-toolbar', StatusBar) || this.dom.append(StatusBar.summon('footer'))
			);
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
