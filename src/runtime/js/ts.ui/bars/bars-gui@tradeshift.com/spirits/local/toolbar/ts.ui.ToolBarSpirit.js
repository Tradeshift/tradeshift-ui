/**
 * Spirit of the toolbar.
 * @using {gui.Combo.chained} chained
 * @using {gui.Client} Client
 * @using {gui.Type} Type
 * @using {gui.Array} guiArray
 * @using {gui.CSSPlugin} CSSPlugin
 * @using {ts.ui.TextModel} TextModel
 * @using {ts.ui.SearchModel} SearchModel
 * @using {ts.ui.TopBar} TopBar
 * @using {ts.ui.ButtonModel} ButtonModel
 */
ts.ui.ToolBarSpirit = (function using(
	chained,
	confirmed,
	Client,
	Type,
	guiArray,
	CSSPlugin,
	DOMPlugin,
	TextModel,
	SearchModel,
	TopBar,
	ButtonModel,
	CLASS_MICRO,
	CLASS_MACRO,
	CLASS_TRANSITION
) {
	/*
	 * When rendering as a statusbar, we'll split into multiple rows
	 * when we hit this breakpoint. Note that this is only used in
	 * the Table component for now, might need an adjustment later.
	 * Breakpoint corresponds to an iPad in vertical orientation.
	 */
	var BREAKPOINT_1 = 768;

	/**
	 * Width of the "+" button to show "more tabs".
	 * @type {number}
	 */
	var WIDTH_MORE_TABS_BUTTON = ts.ui.UNIT * 2;

	/**
	 * Is flexed item?
	 * @param {HTMLLiElement} li
	 * @returns {boolean}
	 */
	function hasflex(li) {
		return CSSPlugin.contains(li, 'ts-flex');
	}

	/**
	 * Used to filter flexed items.
	 * @param {HTMLLiElement} li
	 * @returns {boolean}
	 */
	function nonflex(li) {
		return !CSSPlugin.contains(li, 'ts-flex');
	}

	/**
	 * Used to compute items total width.
	 * @param {number} sum
	 * @param {HTMLLiElement} li
	 * @returns {number}
	 */
	function sumwidth(sum, li) {
		return sum + li.offsetWidth;
	}

	return ts.ui.BarSpirit.extend(
		{
			/**
			 * Get or set visibility.
			 * @type {boolean}
			 */
			visible: {
				getter: function() {
					return this._visible;
				},
				setter: function(is) {
					if (is !== this._visible) {
						if ((this._visible = is)) {
							this.dom.show();
						} else {
							this.dom.hide();
						}
					}
				}
			},

			/**
			 * Sets whether there needs to be a badge shown via collaboration.
			 * @type {boolean}
			 */
			badge: false,

			/**
			 * @see https://github.com/wunderbyte/spiritual-gui/issues/109
			 */
			onenter: function() {
				this._validate();
				this.super.onenter();
				this.action.add([edbml.ACTION_RENDER, 'ts-action-search']);
			},

			/**
			 * Allow subclass to add classname (in `onenter` or
			 * `oncofigure`) before we fall back to `ts-macro`.
			 */
			onready: function() {
				this.super.onready();
				if (
					![CLASS_MICRO, CLASS_MACRO].some(function(cname) {
						return this.css.contains(cname);
					}, this)
				) {
					this.macro();
				}
			},

			/**
			 * Handle action.
			 * @param {gui.Action} a
			 */
			onaction: function(a) {
				this.super.onaction(a);
				switch (a.type) {
					case edbml.ACTION_RENDER:
						this._flex();
						break;
					case 'ts-action-search':
						var li = this.dom.q('.ts-toolbar-search');
						CSSPlugin.shift(li, a.data, 'ts-searching');
						this._flex();
						break;
				}
			},

			/**
			 * Handle event. Focus the search when the title is clicked.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				var title = this.dom.q('.ts-toolbar-title');
				var search = this.dom.q('.ts-search', ts.ui.SearchSpirit);
				if (title && search && DOMPlugin.contains(title, e.target)) {
					search.focus();
				}
			},

			/**
			 * Handle model changes.
			 * @param {Array<edb.Change>} changes
			 */
			onchange: function(changes) {
				this.super.onchange(changes);
				changes.forEach(function(c) {
					if (c.name === 'hascontent') {
						this.$hascontent(c.newValue);
					}
				}, this);
			},

			/**
			 * Clean up.
			 * TODO: Again, this should be handled automatically some day.
			 */
			ondestruct: function() {
				this.super.ondestruct();
				if (this._ismodelled()) {
					this._model.removeObserver(this);
				}
			},

			/**
			 * Show tabs as Menu in Aside (this gets invoked by the EDBML template).
			 * @see ts.ui.TopBarSpirit.edbml
			 * @param {Array<ts.ui.TabModel>} tabs
			 * @param {string} color
			 */
			puttabs: function(tabs) {
				var self = this;
				var selecteditem = null;
				var aside = ts.ui.Aside({
					title: ts.ui.ToolBarSpirit.localize('more'),
					onclosed: function() {
						this.dispose();
						if (selecteditem) {
							self._arraymove(tabs, selecteditem, 1);
						}
					}
				});
				aside.items.push(
					ts.ui.Menu({
						onselect: function(index) {
							var item = this.items[index];
							selecteditem = item.id;
							aside.close();
						},
						items: tabs
							.filter(function(tab) {
								return !tab.$isontop;
							})
							.map(function(tab) {
								return {
									label: tab.label,
									id: tab.$instanceid
								};
							})
							.reverse()
					})
				);
				aside.open();
			},

			/**
			 * Show buttons as Menu in Aside (this gets invoked by the EDBML template).
			 * TODO: Button groups now expands to normal buttons (they get ungrouped)!
			 * @see ts.ui.ToolBarSpirit.edbml
			 * @param {Array<ts.ui.ButtonModel>} buttons
			 * @param {string} color Copy from Tobbar. Now useless(@leo)
			 */
			putaside: function(buttons, color) {
				var selected = null;
				var morphed = [];
				buttons.forEach(function transmorph(button) {
					if (ts.ui.Collection.is(button)) {
						button.forEach(transmorph);
					} else {
						var data = JSON.parse(JSON.stringify(button));
						var clone = new ButtonModel(data);
						clone.onclick = function() {
							selected = button;
							aside.close();
						};
						morphed.push(clone);
					}
				});
				var aside = ts.ui.Aside({
					title: ts.ui.ToolBarSpirit.localize('options'),
					items: [
						ts.ui.Buttons({
							items: morphed.reverse()
						})
					],
					onclosed: function() {
						this.dispose();
						if (selected && selected.onclick) {
							selected.click();
						}
					}
				});
				aside.open();
			},

			/**
			 * Set the toolbar to macro.
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			macro: chained(function() {
				this.css.remove(CLASS_MICRO).add(CLASS_MACRO);
			}),

			/**
			 * Set the toolbar to micro.
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			micro: chained(function() {
				this.css.remove(CLASS_MACRO).add(CLASS_MICRO);
			}),

			/**
			 * Get or set the title (aborting weird Moustache syntax).
			 * Support also `null` because of some flaky Jasmine test.
			 * @param @optional {string|null} title
			 * @returns {string|ts.ui.ToolBarSpirit}
			 */
			title: confirmed('(string|null)')(
				chained(function(opt_title) {
					var model = this.model();
					if (arguments.length) {
						opt_title = opt_title || '';
						if (opt_title.trim().indexOf('{') !== 0) {
							model.title = opt_title;
							this.event.add('click');
							this.$hascontent();
						}
					} else {
						return model.title;
					}
				})
			),

			/**
			 * Get or set the search (getter will *create* the search).
			 * @param @optional {object|ts.ui.SearchModel} opt_json
			 * @returns {ts.ui.SearchModel|ts.ui.ToolBarSpirit}
			 */
			search: confirmed('(object)')(
				chained(function(opt_json) {
					var model = this.model();
					if (arguments.length) {
						this.$hascontent();
						if (model.search) {
							model.search.dispose();
						}
						model.search = SearchModel.from(opt_json);
						model.search.inset = true; // render with border
					} else {
						if (!model.search) {
							this.search({});
						}
						return model.search;
					}
				})
			),

			/**
			 * Get or set the buttons.
			 * @param @optional {Array<object>} opt_json
			 * @returns {ts.ui.ButtonCollection|ts.ui.ToolBarSpirit}
			 */
			buttons: confirmed('(array)')(
				chained(function(opt_json) {
					var buttons = this.model().buttons;
					if (arguments.length) {
						this.$hascontent();
						buttons.clear(); // reusing the collection to preserve observers
						opt_json.forEach(function(json) {
							buttons.push(json);
						});
					} else {
						return buttons;
					}
				})
			),

			/**
			 * Get or set the tabs.
			 * @param @optional {Array<object>} opt_json
			 * @returns {ts.ui.TabCollection|ts.ui.ToolBarSpirit}
			 */
			tabs: confirmed('(array)')(
				chained(function(opt_json) {
					var tabs = this.model().tabs;
					if (arguments.length) {
						this.$hascontent();
						tabs.clear(); // reusing the collection to preserve observers
						opt_json.forEach(function(json) {
							tabs.push(json);
						});
					} else {
						return tabs;
					}
				})
			),

			/**
			 * Get or set the actions.
			 * @param @optional {Array<object>} [json]
			 * @returns {this|ts.ui.ButtonCollection}
			 */
			actions: chained(function(json) {
				var model = this.model();
				if (arguments.length) {
					model.actions = json;
				} else {
					return model.actions;
				}
			}),

			/**
			 * Attempt to economize space by automatically transferring
			 * any assigned buttons (especially tertiary) into an Aside.
			 * Note that this is `true` by defult (make space for tabs).
			 * @param {boolean} compact
			 * @returns {ts.ui.TableSpirit|boolean}
			 */
			compact: chained(function() {
				this.model().compact = true;
			}),

			/**
			 * Don't attempt to economize space by automatically
			 * moving buttons (especially tertiary) into an Aside.
			 * @returns {ts.ui.TableSpirit|boolean}
			 */
			uncompact: chained(function() {
				this.model().compact = false;
			}),

			/**
			 * TODO: Can this be privatized?
			 * Get or set the model. Not recommended.
			 * @param {object|ts.ui.ToolBarModel} model
			 * @returns {ts.ui.ToolBarModel|ts.ui.ToolBarSpirit}
			 */
			model: ts.ui.Spirit.createModelMethod(
				ts.ui.ToolBarModel,
				'ts.ui.ToolBarSpirit.edbml',
				function observe(model) {
					model.addObserver(this);
				}
			),

			/**
			 * Handle EDBML rendered.
			 * @param {TODOType} summary
			 */
			onrender: function(summary) {
				this.super.onrender(summary);
				this._layout();
				this.tick.time(function() {
					this.css.shift(this.dom.q('.ts-toolbar-tabs'), CLASS_TRANSITION);
				});
			},

			/**
			 * Window was resized.
			 */
			onflex: function() {
				this.super.onflex();
				this._layout();
			},

			/**
			 * Hide the ToolBar.
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			hide: chained(function() {
				if (this.visible) {
					this.visible = false;
				}
			}),

			/**
			 * Show the ToolBar.
			 * @returns {ts.ui.ToolBarSpirit}
			 */
			show: chained(function() {
				if (!this.visible) {
					this.visible = true;
				}
			}),

			/**
			 * Clear the ToolBar.
			 * TODO: Do we really want to clear the title?
			 */
			clear: chained(function() {
				var model = this.model();
				model.buttons.clear();
				model.tabs.clear();
				model.search = null;
				model.pager = null;
				model.title = null;
			}),

			/**
			 * Show the close button `X`.
			 * @param {Function|null} onclick
			 * @returns {ts.ui.ButtonSpirit|this}
			 */
			closebutton: chained(function(onclick) {
				var model = this.model();
				if (arguments.length) {
					if (onclick === null) {
						model.closebutton = null;
					} else {
						model.closebutton = {
							onclick: onclick
						};
					}
				} else {
					return model.closebutton;
				}
			}),

			/**
			 * @param {Function|null} onclick
			 * @returns {ts.ui.ButtonSpirit|this}
			 */
			configbutton: chained(function(onclick) {
				var model = this.model();
				if (arguments.length) {
					if (onclick === null) {
						model.configbutton = null;
					} else {
						model.configbutton = {
							onclick: onclick
						};
					}
				} else {
					return model.configbutton;
				}
			}),

			/**
			 * @param {Function|null} onclick
			 * @returns {ts.ui.ButtonSpirit|this}
			 */
			helpbutton: chained(function(onclick) {
				var model = this.model();
				if (arguments.length) {
					if (onclick === null) {
						model.helpbutton = null;
					} else {
						model.helpbutton = {
							onclick: onclick
						};
					}
				} else {
					return model.helpbutton;
				}
			}),

			/**
			 * Show the config button.
			 * @param @optional {Function} onconfig
			 * @returns {this}
			 */
			showConfig: confirmed('(function)')(
				chained(function(onconfig) {
					console.warn('showClose is deprecated, use `closebutton(callback)`');
					this.configbutton.apply(this, arguments);
				})
			),

			/**
			 * Hide the config button.
			 * @returns {this}
			 */
			hideConfig: chained(function() {
				this.closebutton.apply(null);
			}),

			/**
			 * @deprecated
			 * Show the close button "X".
			 * @param @optional {Function} onclose
			 * @returns {this}
			 */
			showClose: confirmed('(function)')(
				chained(function(onclose) {
					console.warn('showClose is deprecated, use `closebutton(callback)`');
					this.closebutton.apply(this, arguments);
				})
			),

			/**
			 * @deprecated
			 * Hide the close button.
			 * @returns {this}
			 */
			hideClose: chained(function() {
				console.warn('hideClose is deprecated, use `closebutton(null)`');
				this.closebutton(null);
			}),

			// Privileged ............................................................

			/**
			 * EDB model observers are always triggered async and this may cause the
			 * (main) toolbars to flicker into existence on page load. When you know
			 * that an operation will cause the toolbar to have content, please make
			 * sure to call this method manually.
			 * TODO(jmo@): Some kind of synchronous observer setup to mitigate this.
			 * @param @optional {boolean} hascontent
			 * @see {ts.ui.ToolBarModel#hascontent} Defaults to `true`
			 */
			$hascontent: function(has) {
				this.life.hascontent = has = arguments.length ? has : true;
				this.life.dispatch(has ? 'ts-life-toolbar-hascontent' : 'ts-life-toolbar-nocontent');
			},

			// Private ...............................................................

			/**
			 * Visible? Please only update this via the `visible` property (no underscore).
			 * @type {boolean}
			 */
			_visible: true,

			/**
			 * Confirm that we don't have hardcoded HTML content,
			 * because the HTML will just be nuked when we render.
			 * TODO: Upgrade this to a `throw` in future version.
			 */
			_validate: function() {
				if (this.element.childElementCount) {
					console.error('The ' + this.$classname + ' should not have HTML content.');
				}
			},

			/**
			 * Compute flex (relative widths) of all members.
			 * Figure out if all tabs can fit inside the bar.
			 */
			_layout: function() {
				var tabs = this._model.tabs;
				if (this.element.offsetWidth) {
					this._flex();
					if (tabs && tabs.getLength()) {
						this._updateselection(tabs);
						this._optimizefit(tabs);
					}
				}
			},

			/**
			 * @param {boolean} show
			 */
			_layoutbefore: function(show) {
				this.css.shift(show, 'ts-toolbar-first');
				var micro = this.css.contains(CLASS_MICRO);
				var klass = 'ts-has-toolbar-first-' + (micro ? 'ts-micro' : 'ts-macro');
				if (this._outsidemodal()) {
					this.guilayout.shiftGlobal(show, klass);
				}
			},

			/**
			 * @param {boolean} show
			 */
			_layoutafter: function(show) {
				this.css.shift(show, 'ts-toolbar-last');
				if (this._outsidemodal()) {
					this.guilayout.shiftGlobal(show, 'ts-has-footer');
					this.action.dispatch(ts.ui.ACTION_FOOTER_LEVEL, show ? 3 : 0);
				}
			},

			/**
			 * Is positioned outside the Main section? Must be called after init phase.
			 * @returns {boolean}
			 */
			_outsidemain: function() {
				return ['ts-toolbar-first', 'ts-toolbar-last'].some(function(cname) {
					return this.css.contains(cname);
				}, this);
			},

			/**
			 * Is positioned inside some kind of Modal?
			 * TODO: We should probably also confirm that we are not in an Aside...
			 * @returns {boolean}
			 */
			_outsidemodal: function() {
				return !this.css.matches('.ts-modal .ts-toolbar');
			},

			/**
			 * When fixed to top or bottom, the Toolbar covers the MAIN scrollbar.
			 * Let's offset it some pixels to the left so that it looks OK again.
			 * @param {gui.CSSPlugin} css
			 */
			_looknormal: function(css) {
				var mobile = ts.ui.isMobilePoint();
				if (
					['ts-toolbar-first', 'ts-toolbar-last'].some(function(klass) {
						return css.contains(klass);
					})
				) {
					css.right = mobile ? Client.scrollBarSize : '';
				}
			},

			/**
			 * Flex toolbar items (step one).
			 */
			_flex: function() {
				var avail = this.box.width;
				var lefts = this.dom.qall('.ts-left > li');
				var right = this.dom.qall('.ts-right > li');
				var extra = this.dom.qall('.ts-center > li');
				var items = lefts.concat(right);
				var small = avail <= BREAKPOINT_1;
				this._cnames(small, lefts, right, extra);
				if (small && this.css.contains('ts-statusbar')) {
					// TODO: move to StatusBarSpirit!
					this._flexnone(items.concat(extra));
				} else {
					if (extra.length) {
						avail = (avail - extra.reduce(sumwidth, 0)) * 0.5;
						this._flexnext(avail, lefts);
						this._flexnext(avail, right);
					} else {
						this._flexnext(avail, items);
					}
				}
			},

			/**
			 * Flex toolbar items (step two).
			 * @param {number} avail
			 * @param {Array<HTMLLiElement>} items
			 */
			_flexnext: function(avail, items) {
				var flexitems = items.filter(hasflex);
				var fixtitems = items.filter(nonflex);
				if (flexitems.length) {
					avail = avail - fixtitems.reduce(sumwidth, 0);
					avail = avail / flexitems.length;
					flexitems.forEach(function(li) {
						li.style.width = avail + 'px';
					});
				} else {
					this._flexnone(items);
				}
			},

			/**
			 * Cleanup all existing flexiness.
			 * @param {Array<HTMLLiElement>} items
			 */
			_flexnone: function(items) {
				items.forEach(function(item) {
					item.style.width = '';
				});
			},

			/**
			 * Toggle some classnames. Mostly relevant for
			 * statusbar rendering in the mobile breakpoint.
			 * @param {boolean} small
			 * @param {Array} lefts
			 * @param {Array} right
			 * @param {Array} extra
			 * @returns {Array<Any>}
			 */
			_cnames: function(small, lefts, right, extra) {
				var search = this.dom.q('.ts-toolbar-search');
				this._docss(this.css, small, lefts.length, right.length, extra.length, search);
			},

			/**
			 * General styling hooks.
			 * @param {gui.CSSPlugin} css
			 * @param {boolean} small
			 * @param {truthy} lefts
			 * @param {truthy} right
			 * @param {truthy} extra
			 * @param {truthy} search
			 */
			_docss: function(css, small, lefts, right, extra, search) {
				css
					.shift(small, 'ts-small')
					.shift(lefts, 'ts-hasleft')
					.shift(right, 'ts-hasright')
					.shift(extra, 'ts-hascenter')
					.shift(search, 'ts-hassearch')
					.shift(!search, 'ts-nosearch');
			},

			/**
			 * Breakpoint changed.
			 */
			_onbreakpoint: function() {
				this.super._onbreakpoint();
				this._looknormal(this.css);
			},

			/**
			 * Hide tabs that won't fit (and show the More-tab). Note
			 * that the More-tab is not rendered in mobile breakpoint.
			 * @param {Array<ts.ui.TabCollection>} tabs
			 */
			_optimizefit: function(tabs) {
				var moretab, avail, dofit;
				var width = WIDTH_MORE_TABS_BUTTON;
				if ((moretab = this.dom.q('.ts-tab-more', ts.ui.Spirit))) {
					moretab.css.display = '';
					avail = this._getavailwidth(ts.ui.UNIT);
					this._setmaxwidth(avail);
					dofit = this._toggletabs(tabs, width, avail);
					moretab.css.display = dofit ? 'none' : '';
					if (!dofit) {
						this._ensureusable(tabs);
					}
				}
			},

			/**
			 * When "more tabs" are hidden in an Aside, make sure that thee selected
			 * tab is always visible by moving it to the second position. This fits
			 * the usecase of some app where the first tab is "home", but we should
			 * probably make this configurable so that the first tab is not sacred.
			 * @param {Array<ts.ui.TabCollection>} tabs
			 */
			_ensureusable: function(tabs) {
				var gonetab;
				if (
					(gonetab = tabs.find(function ishidden(tab) {
						return tab.selected && !tab.$isontop;
					}))
				) {
					this._arraymove(tabs, gonetab.$instanceid, 1);
				}
			},

			/**
			 * Highlight the selected tab.
			 * @param {Array<ts.ui.TabCollection>} tabs
			 */
			_updateselection: function(tabs) {
				this._moveindicator(
					this.dom.q('.ts-tab-indicator', ts.ui.Spirit),
					this.dom.q('.ts-tab.ts-selected', ts.ui.Spirit)
				);
				if (tabs.length === 1) {
					this.dom.q('.ts-tab-indicator', ts.ui.Spirit).dom.hide();
				}
			},

			/**
			 * Move selected tab marker.
			 * @param {ts.ui.Spirit} source
			 * @param {ts.ui.Spirit} target
			 */
			_moveindicator: function(source, target) {
				// var smooth = 'ts-smooth';
				if (source) {
					if (target) {
						source.dom.show();
						source.sprite.x = target.box.localX;
						source.sprite.xscale = target.box.width / 100;
						/*
						if (!source.css.contains(smooth)) {
							this.tick.nextFrame(function starttransitions() {
								source.css.add(smooth);
							});
						}
						*/
					} else {
						// source.css.remove(smooth);
						source.dom.hide();
					}
				}
			},

			/**
			 * Set the max-width, let the tabbar shows at least two tabs
			 * @param {number} avail
			 */
			_setmaxwidth: function(avail) {
				var maxwidth = (avail - 95) / 2; // 88 means the width of more tab(44), two tabs of padding left and right(2 * 2 * 11) and the buffer(7)
				this.dom.qall('.ts-tab-label').forEach(function(tab) {
					tab.style.maxWidth = maxwidth + 'px';
				});
			},

			/**
			 * move an item whoes id is {id} to {toIndex} and then select it.
			 * @param {Array}
			 * @param {String} id
			 * @param {Number} toIndex
			 */
			_arraymove: function(arr, id, toIndex) {
				var fromIndex = -1;
				var element = arr.find(function(item, index) {
					fromIndex = index;
					return item.$instanceid === id;
				});
				element.selected = true;
				arr.splice(fromIndex, 1);
				arr.splice(toIndex, 0, element);
			},

			/**
			 * Toggle tabs that won't fit in the topbar.
			 * @param {Array<ts.ui.TabModel>} tabs
			 * @param {number} moreoffset Width of the More tab
			 * @param {number} availwidth Width of the tabs area
			 * @returns {boolean} True if all tabs can fit
			 */
			_toggletabs: function(tabs, moreoffset, availwidth) {
				var that = this,
					tabspirit,
					taboffset,
					tabsoffset = 0;
				var getspirit = function(tabmodel) {
					return that.dom.q('#' + tabmodel.$instanceid, ts.ui.Spirit);
				};
				return tabs
					.filter(function hotfix(tabmodel) {
						return !!getspirit(tabmodel);
					})
					.reduce(function(isontop, tabmodel) {
						tabspirit = getspirit(tabmodel);
						if (isontop) {
							tabspirit.css.display = '';
							taboffset = tabspirit.box.width;
							isontop = tabsoffset + taboffset < availwidth - moreoffset;
						}
						if (isontop) {
							tabsoffset += taboffset;
							tabmodel.$isontop = true;
						} else {
							tabspirit.css.display = 'none';
							tabmodel.$isontop = false;
						}
						return tabmodel.$isontop;
					}, true);
			},

			/**
			 * Get the tab container maximum length (allowing for the buttons).
			 * @returns {number}
			 */
			_getavailwidth: function(buffer) {
				var right = this.dom.q('.ts-right');
				var center = this.dom.q('.ts-center');
				return (
					this.box.width -
					(right ? right.offsetWidth : 0) -
					(center ? center.offsetWidth : 0) -
					(buffer || 0)
				);
			}
		},
		{
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @param @optional {string} tagname (eg. MENU, HEADER, FOOTER)
			 * @param @optional {string} classname (eg. ts-header, ts-footer)
			 */
			summon: function(tagname, classname) {
				var tag = tagname ? tagname.toLowerCase() : 'menu';
				var elm = document.createElement(tag);
				elm.className = classname || '';
				return this.possess(elm);
			}
		}
	);
})(
	gui.Combo.chained,
	gui.Arguments.confirmed,
	gui.Client,
	gui.Type,
	gui.Array,
	gui.CSSPlugin,
	gui.DOMPlugin,
	ts.ui.TextModel,
	ts.ui.SearchModel,
	ts.ui.TopBar,
	ts.ui.ButtonModel,
	ts.ui.CLASS_MICRO,
	ts.ui.CLASS_MACRO,
	ts.ui.CLASS_TRANSITION
);

/**
 * Default-localize the ToolBarSpirit.
 */
ts.ui.ToolBarSpirit.localize({
	options: 'Options',
	more: 'More...'
});
