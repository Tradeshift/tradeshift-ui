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
	/*
	// when synchronizing the colors, make sure to remove all existing colors...
	var BGCOLORS = (function(colors) {
		return Object.keys(colors).map(function(key) {
			return colors[key];
		});
	})(ts.ui.BACKGROUND_COLORS);

	/**
	 * Extract `ts-bg-` classname from spirit.
	 * @param {ts.ui.Spirit} spirit
	 * @returns {string}
	 *
	function getcolor(spirit) {
		return Object.keys(Colors)
			.map(function(key) {
				return Colors[key];
			})
			.reduce(function(result, color) {
				return result || (spirit.css.contains(color) ? color : null);
			}, null);
	}
	*/

	return ts.ui.BoxSpirit.extend(
		{
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
			 *
			 */
			onconfigure: function() {
				this.super.onconfigure();
				// this.action.add([PANEL_ATTACH, PANEL_DETACH]);
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
			 * Reflex also when moved to another position (V4 scenario)
			 *
			onattach: function() {
				this.super.onattach();
				this._reflex();
			},
			*/

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
				// this._reflex();
			},

			/**
			 * Window resized (probably).
			 *
			onflex: function() {
				this.super.onflex();
				this._reflex();
			},
			*/

			/**
			 * Handle tick.
			 * @param {gui.Tick} t
			 *
			ontick: function(t) {
				this.super.ontick(t);
				if (!this.$destructed && t.type === 'ts-sideshow-theme' && this.dom.embedded()) {
					this._theme = this._theme || this._extractcolor('ts-bg-blue');
					this._transfercolor(this._theme, this.constructor.$bgmembers);
					this._themesupport(this.dom);
					this.tick.remove(t.type);
				}
			},
			*/

			/**
			 * Handle event.
			 * @param {Event} e
			 *
			onevent: function(e) {
				this.super.onevent(e);
				switch (e.type) {
					case 'DOMSubtreeModified':
						this._reflex(); // reflex on footer update in IE
						break;
					case 'transitionend':
						if (this._flipping) {
							this._ontransitionend(ts.ui.get(e.target));
						}
						break;
				}
			},
			*/

			/**
			 * We'll need to support that the tabbar auto-updates whenever a panel gets
			 * added or removed (like we do in the Main TabBar) but for now, we'll just
			 * make sure that these actions (dispatched from the Panel) are contained.
			 * @param {gui.Action} a
			 *
			onaction: function(a) {
				this.super.onaction(a);
				switch (a.type) {
					case PANEL_ATTACH:
					case PANEL_DETACH:
						var panel = a.target;
						var added = a.type === PANEL_ATTACH;
						if (panel.label) {
							// otherwise just ignore
							this._updatetab(panel, added);
						}
						a.consume(); // don't exit the Aside
						break;
				}
			},
			*/

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
					/*
					this._reflex(function() {
						header.title(title);
					});
					*/
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
			 * Snapshot the color scheme asigned via model.
			 * @type {string}
			 *
			_theme: null,
			*/

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
				/*
				var panel,
					avail = this.box.height,
					height = 0,
					thing = action ? action.call(this) : null;
				if (this.isOpen && avail) {
					var asides = [];
					this.dom.children(gui.Spirit).forEach(function(spirit) {
						if (ts.ui.PanelSpirit.is(spirit) && spirit.visible) {
							panel = spirit;
						} else {
							if (ts.ui.AsideSpirit.is(spirit)) {
								asides.push(spirit);
							} else {
								height += spirit.box.height;
							}
						}
					});
					if (panel) {
						panel.css.height = avail - height;
					}
					// TODO: Not this on global reflex!!!!!!!!!
					asides.forEach(function(aside) {
						aside._reflex(); // TODO: not so private after all...
					});
				}
				return thing;
				*/
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
			 * Get the header (and create the header if it doesn't already exist).
			 * @returns {ts.ui.ToolBarSpirit}
			 *
			_header: function() {
				return (
					this.dom.q('this > .ts-header', ts.ui.ToolBarSpirit) ||
					this._reflex(function createheader() {
						var header = ts.ui.ToolBarSpirit.summon('header', 'ts-header');
						this.dom.prepend(header);
						return header;
					})
				);
			},
			*/

			/**
			 * Get the tabbar (and create the tabbar if it doesn't already exist).
			 * @returns {ts.ui.TabBarSpirit}
			 *
			_tabbarspirit: function() {
				return (
					this._tabbar ||
					(this._tabbar = function createit() {
						var panel = this.dom.q('this > .ts-panel', ts.ui.PanelSpirit);
						this._fixappearance();
						this.css.add('ts-has-panels');
						return this._reflex(function() {
							var tabbar = ts.ui.TabBarSpirit.summon();
							tabbar.tabs().addObserver(this);
							return panel.dom.before(tabbar);
						});
					}.call(this))
				);
			},
			*/

			/**
			 * The footer versus panel layout was originally implemented using
			 * flexbox but there was a problem with this whenever CSS transitions
			 * and transform were added, so we've switched to JS layout. This means
			 * that we have to recalculate the layout whenever content is changed
			 * in the footer, but fortunately that's cost-effective nowadays.
			 * TODO: We should at some point attempt to go back to CSS layout,
			 * but note that the problem (in Chrome only!) is only apparent
			 * in a production/sandbox environment. They are however easy to spot.
			 * @param {constructor} Observer Which is undefined in old IE versions
			 *
			_initfooter: function(Observer) {
				var footer = this.dom.q('.ts-footer');
				if (footer) {
					if (Observer) {
						this._observer = new Observer(
							function() {
								this._reflex();
							}.bind(this)
						);
						this._observer.observe(footer, {
							attributes: true,
							childList: true,
							characterData: true,
							subtree: true
						});
					} else {
						// TODO: Perhaps replace this with a timer?
						this.event.add('DOMSubtreeModified', footer, this);
					}
				}
			},
			*/

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
							/*
							this.reflex(function removeheader() {
								tool.dom.remove();
								this._fixappearance();
							}, this);
							*/
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
								that._reflex();
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
					this._reflex(function() {
						bar.dom.remove();
						bar.tabs().removeObserver(this);
						this.css.remove('ts-has-panels');
						this._tabbar = null;
					});
				}
			},

			/**
			 * Added or remove tab for Panel at given index.
			 * TODO: Support a `selected` property in the {ts.ui.PanelSpirit}
			 * TODO: When all panels are done, somehow force `tabbar.script.run()` ...
			 * @param {ts.ui.PanelSpirit} panel
			 *
			_updatetab: function(panel, added) {
				var bar = this._tabbar,
					dom = this.dom;
				var index = dom.children(ts.ui.PanelSpirit).indexOf(panel);
				if (!bar) {
					return;
				}
				if (added) {
					if (index !== 0) {
						panel.hide();
					}
					bar.tabs().splice(index, 0, {
						label: panel.label,
						selected: panel.selected,
						$onselect: function() {
							dom.children(ts.ui.PanelSpirit).forEach(function(p) {
								if (p === panel) {
									p.show();
									p.$onselect();
									// TODO: scroll to zero?
								} else {
									p.hide();
								}
							});
						}
					});
				} else {
					bar
						.tabs()
						.splice(index, 1)
						.forEach(function(tab) {
							if (tab.selected) {
								var selectedindex = index ? index - 1 : index;
								bar.tabs()[selectedindex].select();
							}
							tab.dispose();
						});
					if (bar.tabs().length === 1) {
						this._removetabbar();
					}
				}
				bar.$hascontent(); // for the tabbar to render instantly
			},
			*/

			/**
			 * If spirit was created via a model, return the model color.
			 * Otherwise return any bg-color classname found in the HTML
			 * and also *remove it* (it will soon be applied elsewhere)
			 * so that (in a future project) we can flip the Aside nicely.
			 * @param {string} color Fallback color!
			 * @returns {string}
			 *
			_extractcolor: function(color) {
				function fixweirdlooking(c) {
					return c.match(/ts-bg-lite|ts-bg-white/) ? 'ts-bg-blue' : c;
				}
				if (this._ismodelled() && this._model.color) {
					color = fixweirdlooking(this._model.color);
				} else {
					GuiObject.each(
						Colors,
						function(key, value) {
							if (this.css.contains(value)) {
								this.css.remove((color = value));
							}
						},
						this
					);
				}
				return color;
			},
			*/

			/**
			 * Transform background color to members (unless it
			 * already has a background color classname given).
			 * @param {string} color
			 * @param {Array<string>} selectors
			 *
			_transfercolor: function(color, selectors) {
				var dom = this.dom;
				selectors.forEach(function(selector) {
					dom
						.qall(selector, ts.ui.Spirit)
						.filter(function() {
							return true;
						})
						.forEach(function(spirit) {
							switch (selector) {
								case '.ts-header':
								case '.ts-tabbar':
									spirit.css.remove(BGCOLORS).add(color);
									if (spirit._ismodelled()) {
										spirit._model.color = color;
									}
									break;
								default:
									var classname = spirit.css.name();
									if (!classname.includes('ts-bg')) {
										spirit.css.add(color);
									}
									break;
							}
						});
				});
			},
			*/

			/**
			 * Apply color theme extras. The dropshadows are done with DIVs (instead
			 * of using CSS box-shadow) to keep them under control without using any
			 * kind of z-index, since this would mess up the general page layout.
			 * @param {gui.DOMPlugin} dom
			 *
			_themesupport: function(dom) {
				var shade = Parser.parseToNode('<div class="ts-shadow"></div>');
				var panel = dom.q('this > .ts-panel', ts.ui.PanelSpirit);
				var headr = dom.q('this > .ts-header', ts.ui.ToolBarSpirit);
				var footr = dom.q('this > .ts-footer', ts.ui.AsideFooterSpirit);
				var tabbs = dom.q('this > .ts-tabbar', ts.ui.TabBarSpirit);
				if (panel) {
					// hotfix issue in React pending investigation
					var color = getcolor(panel) || 'ts-bg-white';
					dom.qall('.ts-shadow').forEach(function dontduplicate(shadow) {
						shadow.parentNode.removeChild(shadow);
					});
					if (tabbs && getcolor(tabbs) !== color) {
						tabbs.white();
					} else if (
						[tabbs, headr].every(function(thing) {
							return thing && getcolor(thing) === color;
						})
					) {
						panel.dom.before(shade.cloneNode());
						headr.css.add('ts-inset');
					} else if (headr && getcolor(headr) === color) {
						panel.dom.before(shade.cloneNode());
					}
					if (footr && getcolor(footr) === color) {
						footr.dom.before(shade.cloneNode());
					}
				}
			},
			*/

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
		},
		{
			// Xstatic ..............................................................

			/**
			 * List of members that should inherit any assigned background color.
			 * @type {Array<string>}
			 */
			$bgmembers: ['.ts-header']
		}
	);
})(
	gui.Combo.chained,
	gui.Client,
	gui.HTMLParser,
	gui.Object,
	ts.ui.BACKGROUND_COLORS,
	ts.ui.ACTION_PANEL_ATTACH,
	ts.ui.ACTION_PANEL_DETACH
);
