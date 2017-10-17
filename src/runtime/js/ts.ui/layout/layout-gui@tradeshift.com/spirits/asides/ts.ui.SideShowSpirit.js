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
	return ts.ui.BoxSpirit.extend({
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
			 * ts.ui.SpinnerSpirit.
			 */
		spin: null,

		/**
			 * @param {boolean} busy
			 */
		busy: function(busy) {
			this._initspin(busy);
			if (busy) {
				this.guistatus.busy(this.$instanceid);
			} else {
				this.guistatus.done(this.$instanceid);
			}
		},

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
			// this._initfooter(window.MutationObserver || window.WebKitMutationObserver);
			this._inittabs();
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
				header.title(title);
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

		// Privileged ............................................................

		/**
			 * Required by the {DoorManPlugin}.
			 */
		$onopen: function() {},

		/**
			 * Required by the {DoorManPlugin}.
			 */
		$onclose: function() {},

		// Private ...............................................................

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
			 * Let's just `macro` the toolbar here for now.
			 * @returns {ts.ui.HeaderBarSpirit}
			 */
		_head: function() {
			return ts.ui.BoxSpirit.majorHeader(this);
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
				tool.showClose(function() {
					that.close();
				});
			} else if (this._canclose) {
				this._canclose = false;
				tool.hideClose();
				// if `autoclose` was changed sometime *after* initialization,
				// we'll need to remove any header that doesn't have a `title`
				// while accounting for the fact that models are updated async.
				this.tick.time(function asyncproblem() {
					if (!tool.life.hascontent) {
						tool.dom.remove();
					}
				}, 50);
			}
		},

		/**
			 * If you set the attribute ts.busy is true, you will see the spinner in the main
			 * param {boolean} busy
			 */
		_initspin: function(busy) {
			if (!this.spin) {
				this.spin = ts.ui.SpinnerSpirit.summon();
			}
			if (busy) {
				var opts = {
					message: busy,
					top: '226px'
				};
				this.spin.spin(this.element, opts);
			} else {
				this.spin.stop();
			}
		},

		/**
			 * If more than one panel next to aside, generate the tabbar automaticly
			 */
		_inittabs: function() {
			var panels = this.dom.children(ts.ui.PanelSpirit);
			if (panels.length > 1) {
				if (
					panels.every(function(panel) {
						return !!panel.label;
					})
				) {
					this._setuptabs(panels, this);
				} else {
					console.warn(
						'(Multiple) Panels in Aside must have ' + 'a label in order to create the TabBar'
					);
				}
			}
		},

		/**
			 * Multiple panels found, setup the tabbar to switch between them.
			 * @param {Array<ts.ui.PanelSpirit>} panels
			 * @param {ts.ui.SideBarSpirit} that
			 */
		_setuptabs: function(panels, that) {
			var tabbar = this._head();
			panels.forEach(function(panel, index) {
				tabbar.tabs().push({
					label: panel.label,
					selected: index === 0,
					$onselect: function() {
						if (!that.$destructed) {
							that.dom.children(ts.ui.PanelSpirit).forEach(function(p) {
								if (p === panel) {
									p.show();
									p.$onselect();
									// TODO: scroll to zero?
								} else {
									p.hide();
								}
							});
						}
					}
				});
			});
		},

		/**
			 * Remove the tabbar.
			 */
		_removetabbar: function() {
			var bar = this._tabbar;
			if (bar) {
				bar.dom.remove();
				bar.tabs().removeObserver(this);
				this.css.remove('ts-has-panels');
				this._tabbar = null;
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
})(
	gui.Combo.chained,
	gui.Client,
	gui.HTMLParser,
	gui.Object,
	ts.ui.BACKGROUND_COLORS,
	ts.ui.ACTION_PANEL_ATTACH,
	ts.ui.ACTION_PANEL_DETACH
);
