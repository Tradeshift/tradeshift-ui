/**
 * Base spirit for aside-like components.
 * @see {ts.ui.AsideSpirit}
 * @see {ts.ui.SideBarSpirit}
 * @see @deprecated {ts.ui.DrawerSpirit}
 * @using {gui.Combo.chained}
 * @using {gui.Client} Client
 * @using {gui.HTMLParser} Parser
 * @using {gui.Object} GuiObject
 * @using {ts.ui.BACKGROUND_COLORS} Colors
 * @using {ts.ui.ACTION_PANEL_ATTACH} PANEL_ATTACH
 * @using {ts.ui.ACTION_PANEL_DETACH} PANEL_DETACH
 */
ts.ui.SideShowSpirit = (function using(
	chained,
	Client,
	Parser,
	GuiObject,
	Colors,
	PANEL_ATTACH,
	PANEL_DETACH
) {
	return ts.ui.LayoutSpirit.extend({
		/**
		 * Open?
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
		 * Open by default?
		 */
		onenter: function() {
			this.super.onenter();
			if (this.isOpen) {
				this.open();
			}
		},

		/**
		 * Get ready.
		 */
		onready: function() {
			this.super.onready();
			this._confirmpanel();
			this.css.add('ts-sideshow');
		},

		/**
		 * Detach hacky mutation observer.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			if (this._observer) {
				this._observer.disconnect();
			}
		},

		/**
		 * On EDBML rendered.
		 */
		onrender: function() {
			this.super.onrender();
			this._confirmpanel();
		},

		/**
		 * Observing the tabbar tabs.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			var splice = edb.ArrayChange.TYPE_SPLICE;
			changes
				.filter(function(c) {
					return c.type === splice && ts.ui.TabCollection.is(c.object);
				})
				.forEach(function(c) {
					if (c.object.length === 0) {
						this._removetabbar();
					}
				}, this);
		},

		/**
		 * Set or get header title.
		 * @param {string} title
		 * @return {ts.ui.AsideSpirit|string}
		 */
		title: chained(function(title) {
			var header = this._head();
			if (arguments.length) {
				header.title(String(title));
			} else {
				return header.title();
			}
		}),

		/**
		 * Get or set the titlebar search model.
		 * @param {Object|ts.ui.SearchModel} search
		 * @returns {ts.ui.SearchModel|ts.ui.SideShowSpirit}
		 */
		search: chained(function(search) {
			var header = this._head();
			if (arguments.length) {
				header.search(search);
			} else {
				return header.search();
			}
		}),

		/**
		 * Get or set header model. TODO: Should be private, huh?
		 * @param @optional {object} opt_json
		 * @returns {ts.ui.ToolBarModel}
		 */
		header: function(opt_json) {
			return this._head().model(opt_json);
		},

		/**
		 * Open AND close the Aside (setup to support HTML `data-ts.open="true|false"`)
		 * @param @optional {boolean} opt_open Omit to simply open.
		 * @return {ts.ui.AsideSpirit}
		 */
		open: chained(function(opt_open) {
			this.doorman.open(opt_open);
		}),

		/**
		 * Close the aside.
		 * @return {ts.ui.AsideSpirit}
		 */
		close: chained(function() {
			this.doorman.open(false);
		}),

		/**
		 * Toggle the aside.
		 * @return {ts.ui.AsideSpirit}
		 */
		toggle: chained(function() {
			this.open(!this.isOpen);
		}),

		/**
		 * Programatically create those tabs (or modify some declarative tabs).
		 * @returns {ts.ui.TabCollection|ts.ui.SideShowSpirit}
		 */
		tabs: chained(function() {
			var tabbar = this._head();
			if (arguments.length) {
				tabbar.tabs.apply(tabbar, arguments);
			} else {
				return tabbar.tabs();
			}
		}),

		// Privileged ..............................................................

		/**
		 * Required by the {DoorManPlugin}.
		 */
		$onopen: function() {
			this.dom.show();
			this._slideopen(true).then(
				function done() {
					this._ontransitionend();
				}.bind(this)
			);
		},

		/**
		 * Required by the {DoorManPlugin}.
		 */
		$onclose: function() {
			this._slideopen(false).then(
				function done() {
					this._ontransitionend();
					this.dom.hide();
				}.bind(this)
			);
		},

		// Private .................................................................

		/**
		 * The Main tabbar.
		 * @type {ts.ui.TabBarSpirit}
		 */
		_tabbar: null,

		/**
		 * Monitor footer updates until we can enable CSS layout again.
		 * @type {MutationObserver}
		 */
		_observer: null,

		/**
		 * Configured with the closing "X" button?
		 * @type {boolean}
		 */
		_canclose: false,

		/**
		 * If this thing is nested in a SideBar,
		 * make the header become less prominent.
		 * TODO: Not if it's a *root* SideBar :/
		 * @returns {ts.ui.HeaderBarSpirit}
		 */
		_head: function() {
			return this.dom.parent(ts.ui.SideBarSpirit)
				? ts.ui.LayoutSpirit.microHeader(this)
				: ts.ui.LayoutSpirit.macroHeader(this);
		},

		/**
		 * Using JS instead of CSS flex because Chrome has a nasty public breakdown.
		 * TODO: Setup to only reflex if the height of header or footer has changed.
		 * @param @optional {function} action Optionally flex after executing this.
		 * @returns {object}
		 */
		_reflex: function(action) {
			return action ? action.call(this) : null;
		},

		/**
		 * Confirm and setup the panel. We'll skip this in IE where
		 * React is known to render the DOM tree in reverse sometimes.
		 * @return {ts.ui.Spirit}
		 */
		_confirmpanel: function() {
			if (!Client.isExplorer) {
				if (!this.dom.q('.ts-panel', ts.ui.PanelSpirit)) {
					throw new Error('Expected a Panel');
				}
			}
		},

		/**
		 * Confirm that we're not nested inside MAIN.
		 * - The {ts.ui.AsideSpirit} does this when it opens
		 * - The {ts.ui.SideShowSpirit} does it after a second
		 * - The {ts.ui.CollaborationSpirit} doesn't do this because of politics.
		 */
		_confirmposition: function() {
			if (!this.guilayout.outsideMain()) {
				throw new Error(this + ' must be positioned outside Main', this.element);
			}
		},

		/**
		 * Add or remove the closing "X" button in the titlebar.
		 * @param @optional {boolean} show
		 */
		_closebutton: function(show) {
			var that = this;
			var tool = this._head();
			if (show !== false) {
				this._canclose = true;
				tool.closebutton(function() {
					that.close();
				});
			} else if (this._canclose) {
				this._canclose = false;
				tool.closebutton(null);
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
		},

		/**
		 * All attempts to animate the Aside with ordinary CSS transitions
		 * would result in fatal rendering glitches that only occurs in a
		 * production environment, of course. Using the brute force method.
		 * UPDATE: This was caused by Track.js versus `handleEvent` so we
		 * can go ahead and use CSS transitions now :)
		 * @param {boolean} open
		 * @param @optional {boolean} callback
		 * @returns {gui.Then}
		 */
		_slideopen: function(open, callback) {
			var then = new gui.Then();
			var tick = this.tick;
			var end = ts.ui.TRANSITION_FAST;
			var deg, off;
			function getoffset(now) {
				deg = now / (end / 90);
				deg = (deg * Math.PI) / 180;
				off = open ? Math.sin(deg) : Math.cos(deg);
				return off * 100;
			}
			tick.time(function() {
				var time = 0;
				tick.nextFrame(function paint(stamp) {
					if (!this.$destructed) {
						if (!time) {
							time = stamp;
							tick.nextFrame(paint);
						} else {
							var now = stamp - time;
							var pct = getoffset(now);
							if (now < end) {
								this._position(100 - pct);
								tick.nextFrame(paint);
							} else {
								this._position(open ? 0 : 100);
								then.now();
							}
						}
					}
				});
			}, ts.ui.TRANSITION_DELAY);
			return then;
		},

		/**
		 * Update position.
		 * @param {number} pct
		 */
		_position: function(pct) {
			if (this.element.className.indexOf('ts-sidebar-first') > 0) {
				pct = -pct;
			}
			this.css.set('-beta-transform', 'translate3d(' + pct + '%,0,0)');
		},

		/**
		 * Subclass will do something here.
		 */
		_ontransitionend: function() {}
	});
})(
	gui.Combo.chained,
	gui.Client,
	gui.HTMLParser,
	gui.Object,
	ts.ui.BACKGROUND_COLORS,
	ts.ui.ACTION_PANEL_ATTACH,
	ts.ui.ACTION_PANEL_DETACH
);
