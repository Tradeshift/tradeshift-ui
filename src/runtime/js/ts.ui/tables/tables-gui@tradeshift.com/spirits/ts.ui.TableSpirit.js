/**
 * TODO: Reset this._scroll.y when sorting (also when searching, but how)?
 * TODO: Reset pager when when sorting (also when searching, but how)?
 * @using {gui.Type} Type
 * @using {gui.Client} Client
 * @uisng {gui.Array} guiArray
 * @using {gui.DOMPlugin} DOMPlugin
 * @using {gui.CSSPlugin} CSSPlugin
 * @using {gui.ConfigPlugin} ConfigPlugin
 * @using {gui.Position} Position
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} chained
 * @using {ts.ui.TableRowModel} TableRowModel
 * @using {ts.ui.ButtonSpiri	t} ButtonSpirit
 * @using {ts.ui.PagerModel} pager
 * @using {number} UNIT_DOUBLE
 */
ts.ui.TableSpirit = (function using(
	Type,
	Client,
	guiArray,
	DOMPlugin,
	CSSPlugin,
	ConfigPlugin,
	Position,
	chained,
	confirmed,
	TableRowModel,
	ButtonSpirit,
	PagerModel,
	UNIT_DOUBLE
) {
	var ICON_OFF = 'ts-icon-checkbox';
	var CLASS_TEXTAREA = 'ts-table-input';
	var CLASS_CLICKABLE = 'ts-clickable';
	var CLASS_MAXIMIZED = 'ts-maximized';
	var CLASS_SELECTABLE = 'ts-selectable';
	var CLASS_SELECTBUTTON = 'ts-table-checkbox-button';

	/**
	 * Is something simple?
	 * @param {object|string|number|boolean} x
	 * @returns {boolean}
	 */
	function primitive(x) {
		switch (Type.of(x)) {
			case 'string':
			case 'number':
			case 'boolean':
				return true;
		}
		return false;
	}

	/**
	 * TODO: Fix that EDB cornercase (and update all the depends on old behavior)
	 * TODO: The TableModel should assign these indexes!!!
	 * TODO: validate object-with-label-property
	 * @param {object|string|number|boolean} x
	 * @returns {object}
	 */
	function colify(x, i) {
		if (primitive(x)) {
			x = {
				label: x
			};
		}
		if (!x.search) {
			// can't NOT have a search because EDB wrongful convention :/
			x.search = {
				hidden: true
			};
		}
		if (!x.button) {
			// can't NOT have a button because EDB wrongful convention :/
			x.button = {
				hidden: true
			};
		}
		x.$index = i;
		x.search.$index = i;
		x.button.type = 'ts-default';
		return x;
	}

	/**
	 * Something is selected?
	 * @param {object} x
	 * @returns {boolean}
	 */
	// eslint-disable-next-line no-unused-vars
	function selected(x) {
		return !!x.selected;
	}

	/**
	 * Something is visible?
	 * @param {object} x
	 * @returns {boolean}
	 */
	function visible(x) {
		return !!x.visible;
	}

	/**
	 * Map array member to index.
	 * @param {object} x
	 * @param {number} i
	 * @returns {number}
	 */
	function indexes(x, i) {
		return i;
	}

	/**
	 * TODO: Think some more about this....
	 * TODO: More error info goes here...
	 */
	function maxerror() {
		throw new Error(["You shouldn't set max() rows when the table is maximized."].join(''));
	}

	/**
	 * Support both x number of arguments and one array of x items.
	 * @param {Arguments|Array} args
	 * @returns {Array}
	 */
	function makearray(args) {
		var first = args[0];
		if (first && Array.isArray(first)) {
			return first;
		} else {
			return guiArray.from(args);
		}
	}

	/**
	 * Since we are deliberately not creating models of the rows,
	 * we'll need to *clone* the data so that our state doesn't get
	 * entangled into something that the user might depend upon.
	 * Specifically, we don't want Angular models in our structure.
	 * @param {object|array} thing
	 * @returns {object|array}
	 */
	function deepclone(thing) {
		return JSON.parse(JSON.stringify(thing));
	}

	/**
	 * Clientside sorting is slow. Let's at least announce the fact.
	 * TODO: Measure how well clientside search stacks up to this.
	 * @param {boolean} required (should really be device specific)
	 */
	function perfwarning(required) {
		if (required) {
			console.warn(
				'The client will freeze while we sort this many ' +
					'rows. If you see this warning, please remind ' +
					'us to sort the data in a Worker process.'
			);
		}
	}

	return ts.ui.Spirit.extend({
		/**
		 * Open for implementation: Called whenever a cell is clicked.
		 * @type {function}
		 * @param {object} cell
		 * @param {number} rowindex
		 * @param {number} cellindex
		 */
		onclick: null,

		/**
		 * Open for implementation: Called whenever row(s) get toggled.
		 * @type {function}
		 * @param {Array<ts.ui.RowModel>} selected
		 * @param {Array<ts.ui.RowModel>} unselected (but was selected)
		 */
		onselect: null,

		/**
		 * Open for implementation: Called after window resize and when
		 * the Table itself is done resizing and flexing and fixing it.
		 * @type {function}
		 * @param {number} maxrows that can be fitted in a single page.
		 */
		onresize: null,

		/**
		 * Open for implementation: Called when a link is clicked somewhere
		 * in the table cells. The links `href` is passed as an argument.
		 * The links, by the way, can be declared with some markdown syntax.
		 * @type {function}
		 */
		onlink: null,

		/**
		 * Open for implementation: Called when a cell value is edited.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 * @param {string|number} newval
		 * @param {string|number} oldval
		 * @type {function}
		 */
		onedit: null,

		/**
		 * Open for implementation: Called when a new page is selected in Pager.
		 * This is mostly relevant for "clientside" tables (mounting all pages)
		 * where the Pager is not created and handled by the developer himself.
		 * @type {function}
		 */
		onpage: null,

		/**
		 * Open for implementation: Called whenever headers are clicked.
		 * @param {number} index
		 * @param {boolean} ascending
		 */
		onsort: function(index, ascending) {
			this.sort(index, ascending);
		},

		/**
		 * Create the model.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._model = new ts.ui.TableModel();
			this._model.rows.addObserver(this);
			this._renderqueue = [];
		},

		/**
		 * We'll render the table ourselves because otherwise we'll
		 * run into the old relative position in tabels bug (Gecko).
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.action.add([ts.ui.ACTION_CLICK, ts.ui.ACTION_SWITCH]);
			this.event.add('click');
			this.css.add('ts-table-list'); // TODO: Merge into default CSS when approved!
			this._rowsadd = [];
			this._rowsoff = [];
			this._scroll = new Position();
			this.action.add([
				ts.ui.ACTION_FOOTER_LEVEL,
				ts.ui.ACTION_PAGER_SELECT,
				ts.ui.ACTION_SAFE_LINK
			]);
			if (this.dom.tag() === 'table') {
				throw new SyntaxError(
					'Contrary to common belief, the ts.ui.Table ' +
						'component must not be attached to a TABLE.'
				);
			}
		},

		/**
		 * Load the script. Input the model.
		 */
		onenter: function() {
			this.super.onenter();
			this.script.load(ts.ui.TableSpirit.edbml);
			this.script.input(this._model);
		},

		/**
		 * Release any observers when disposed.
		 * TODO: This automatically in Spiritual :/
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this._model.dispose();
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			var elm = e.target;
			switch (e.type) {
				case 'click':
					this._onclick(elm, e);
					break;
				case 'scroll':
					if (!this._noscrolling) {
						// WebKit scroll-collapse workaround :/
						this._hackscrolling();
					} else if (this._scrollfixing) {
						this.queryplugin.getrows().querySelector('table').style.left = 0;
					}
					break;
			}
		},

		/**
		 * We know that this broadcast will trigger the reflex crawler,
		 * so we will quickly perfome some calculations before the
		 * crawler arrives to trigger the `onflex` method (see below).
		 * @param {gui.Broadcast} b
		 */
		onbroadcast: function(b) {
			this.super.onbroadcast(b);
			if (b.type === gui.BROADCAST_RESIZE_END) {
				if (this._autooptimize) {
					this._onbeforeresize(this._model);
				}
			}
		},

		/**
		 * Window was (most likely) resized. Note that devs should
		 * call `table.reflex()` and not 'table.onflex()` if the
		 * layout has changed to impact maximized Tables because
		 * that's how the API is supposed to work (so everything
		 * that starts with `on` should never be manually invoked).
		 */
		onflex: function() {
			this.super.onflex();
			if (this._crashproof()) {
				if (this._ismaximized()) {
					this._onafterresize(this._target);
					if (this._autooptimize) {
						this._maxpages();
					}
				} else {
					this._layouteverything();
				}
			}
		},

		/**
		 * Account for the footerbar breaking up into multiple
		 * levels in small table, basically copy the classname
		 * from the statusbar for the CSS to work with.
		 * @see {ts.ui.ToolBarSpirit#_specialcnames}
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			switch (a.type) {
				case ts.ui.ACTION_FOOTER_LEVEL:
					this.guilayout.gotoLevel(a.data);
					this._onafterresize(); // after resize, `onresize` might now be called twice :/
					a.consume();
					break;
				case ts.ui.ACTION_PAGER_SELECT:
					this._flag = 'paging';
					this._resetscrolling();
					a.consume();
					break;
				case ts.ui.ACTION_SAFE_LINK:
					if (Type.isFunction(this.onlink)) {
						this.onlink.call(this, a.data);
					}
					a.consume();
					break;
				case ts.ui.ACTION_CLICK:
					this._onextra(this.onbutton, a.target);
					a.consume();
					break;
				case ts.ui.ACTION_SWITCH:
					this._onextra(this.onswitch, a.target, a.data);
					a.consume();
					break;
			}
		},

		/**
		 * Open for implementation.
		 * @param {string} name
		 * @param {*} value
		 */
		onbutton: function(name, value) {},

		/**
		 * Open for implementation.
		 * @param {string} name
		 * @param {*} value
		 * @param {boolean} checked
		 */
		onswitch: function(name, value, checked) {},

		/**
		 * Handle tick to evaluate the `onselect` callback.
		 * @param {gui.Tick} t
		 */
		ontick: function(t) {
			this.super.ontick(t);
			if (t.type === this._TICKSELECT) {
				if (this.onselect) {
					this.onselect.call(this, this._rowsadd, this._rowsoff);
					this._rowsadd = [];
					this._rowsoff = [];
				}
			}
		},

		/**
		 * Handle (model) changes. When rows are updated using array methods, we'll
		 * update the pager (after some time, in case more updates are comming in).
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			if (this._model.maxrows && !this._rowsmutated) {
				var type = edb.ArrayChange.TYPE_SPLICE;
				var rows = this._model.rows;
				changes.forEach(function(c) {
					if (c.object === rows && c.type === type) {
						this._rowsmutated = true;
					}
				}, this);
			}
		},

		// Building ................................................................

		/**
		 * @param @optional {Array<string, object>} data
		 * @returns {ts.ui.TableSpirit|ts.ui.TableColCollection}
		 */
		cols: confirmed('(array)')(
			chained(function(input) {
				var cols = this._model.cols;
				if (arguments.length) {
					input = input.map(colify);
					this._model.cols = input;
				} else {
					return cols;
				}
			})
		),

		/**
		 * Set the rows. Note that the rows are not "live" models,
		 * so you should not try to use this method as a getter
		 * unless you know exactly what you are doing.
		 * @param @optional {Array<Array<string, object>>} json
		 * @returns {ts.ui.TableSpirit|ts.ui.TableRowCollection}
		 */
		rows: confirmed('(array)')(
			chained(function(json) {
				var model = this._model;
				if (arguments.length) {
					model.removeObserver(this);
					model.rows = deepclone(json);
					model.addObserver(this);
					this._resetpager();
				} else {
					return model.rows;
				}
			})
		),

		/**
		 * Get or set row at index.
		 * @param {number} rowindex
		 * @param @optional {object|array} json
		 * @returns {object|ts.ui.TableSpirit}
		 */
		row: confirmed('number', '(object|array)')(
			chained(function(rowindex, json) {
				var model = this._model;
				var asobject = true;
				if (arguments.length > 1) {
					model.setrow(rowindex, json);
				} else {
					return model.getrow(rowindex, asobject);
				}
			})
		),

		/**
		 * Get or set cell at indexes.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 * @param @optional {object|string|number|*} json
		 * @returns {object|ts.ui.TableSpirit}
		 */
		cell: confirmed('number', 'number', '(*)')(
			chained(function(rowindex, cellindex, newcell) {
				var model = this._model;
				var asobject = true;
				if (arguments.length > 2) {
					model.setcell(rowindex, cellindex, newcell);
					// TODO(jmo@): reverse area sync may be needed :/
				} else {
					return model.getcell(rowindex, cellindex, asobject);
				}
			})
		),

		/**
		 * Mark cell invalid.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 * @param {string} message
		 * @returns {object|ts.ui.TableSpirit}
		 */
		invalid: confirmed('number', 'number', '(string)')(
			chained(function(rowindex, cellindex, message) {
				this._model.setvalidity(false, rowindex, cellindex, message);
				if (this._model.editable) {
					// attach the classname max pronto
					this.editorplugin.failfast(rowindex, cellindex);
				}
			})
		),

		/**
		 * Mark cell valid.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 * @returns {object|ts.ui.TableSpirit}
		 */
		valid: confirmed('number', 'number')(
			chained(function(rowindex, cellindex) {
				this._model.setvalidity(true, rowindex, cellindex);
			})
		),

		// Layout ..................................................................

		/**
		 * Expand to fill nearest positioned ancestor.  If the callback is
		 * provided, this can be used to manually calculate the optimal
		 * rowcount (backend-Table scenario).
		 * @param {Function} onresize
		 * @returns {this}
		 */
		explode: confirmed('(function)')(
			chained(function(onresize) {
				this.css.add(CLASS_MAXIMIZED);
				if (arguments.length) {
					this.broadcast.add(gui.BROADCAST_RESIZE_END);
					this._maybecallresize(onresize);
				}
			})
		),

		/**
		 * Don't expand no more.
		 * @returns {this}
		 */
		implode: chained(function() {
			this.css.remove(CLASS_MAXIMIZED);
			this.onresize = null;
		}),

		/**
		 * Automatically optimize the rowcount per page to fill the screen
		 * (or nearest positioned ancestor) with as little need for scrolling
		 * as possible.
		 * TODO: Warning if `rows` are mounted before `optimize` is called (perf)
		 * TODO: Console warn when not used in combination with `explode()`
		 * @returns {this}
		 */
		optimize: chained(function() {
			this.broadcast.add(gui.BROADCAST_RESIZE_END);
			this._autooptimize = true;
			this.max();
			this._createpager();
		}),

		/**
		 * Just to revert the `optimize` method, however unlikely that might be.
		 * @returns {this}
		 */
		deoptimize: chained(function() {
			this._autooptimize = false;
			this._model.toolbar.pager = null;
			this._model.maxrows = 0;
			if (!this.onresize) {
				this.broadcast.remove(gui.BROADCAST_RESIZE_END);
			}
		}),

		/**
		 * @deprecated
		 * Maximize the layout to fill positioned container AND automatically
		 * optimize+autopage the content. This procedure has been split into
		 * two distinct methods, but we will keep this for legacy reasons.
		 * In V4, this method is used both "backend" Tables even though the
		 * `optimize` method is called (which autopaginates the Table), this
		 * setup is of course wrong and we are just lucky that things work :/
		 * TODO: If and when we have the documentation for these features,
		 * show some warning in the console and prepare to deprecate this.
		 * @param @optional {function} onresize
		 * @returns {ts.ui.TableSpirit}
		 */
		maximize: confirmed('(function)')(
			chained(function(onresize) {
				this.explode.apply(this, arguments);
				this.optimize();
			})
		),

		// Paging ..................................................................

		/**
		 * Set maximum number of rows to show (per page).
		 * If the table is maximized, call with no args to:
		 * 1) autofit the amount of rows to the height and...
		 * 2) return this number (of rows that would fit)
		 * The number can be used to limit an API request.
		 * @param @optional {number} n
		 * @returns {number|ts.ui.TableSpirit}
		 */
		max: confirmed('(number)')(
			chained(function(n) {
				var cname = 'ts-hasrows ts-maxrows';
				var optim = this._autooptimize;
				var model = this._model;
				if (arguments.length) {
					if (optim) {
						maxerror();
					} else {
						model.maxrows = n;
						this._createpager();
						if (model.toolbar.pager) {
							model.toolbar.pager.number = n;
						}
						this._renderqueue.push(function() {
							this.css.shift(n, cname);
						});
					}
				} else if (optim) {
					return this._autooptimize ? this._automax() : this._calcmax();
				} else {
					return model.maxrows;
				}
			})
		),

		/**
		 * Works like {ts.ui.TableSpirit#max}, but fixes the height
		 * of the Table so that it doesn't jump when the data arrives.
		 * You can pass a `0` (zero) to reset a previously set size.
		 * @param @optional {number} n
		 * @param @internal {boolean} fixed
		 * @returns {number|ts.ui.TableSpirit}
		 */
		size: confirmed('(number)')(
			chained(function(n) {
				this.$fixedsize = n;
				this.max(n);
			})
		),

		/**
		 * Get or set the total of the items
		 * Show the information in the pager status
		 * @param @optional {number} n
		 * @returns {number|ts.ui.TableSpirit}
		 */
		total: confirmed('(number)')(
			chained(function(n) {
				var model = this._model;
				var toolb = model.toolbar;
				var pager = toolb.pager;
				if (arguments.length) {
					model.total = n;
					if (pager) {
						pager.total = n;
						pager._initstatus();
					}
				} else {
					return model.total;
				}
			})
		),

		/**
		 * Get or set the (toolbar) pager.
		 * @param @optional {JSONObject|ts.ui.PagerModel} json
		 * @returns {ts.ui.TableSpirit|ts.ui.PagerModel}
		 */
		pager: chained(function(json) {
			var model = this._model;
			var toolb = model.toolbar;
			var pager = toolb.pager;
			if (arguments.length) {
				this._createpager(json);
				this._ownpager = false;
			} else {
				return pager;
			}
		}),

		/**
		 * Set the style of the table.
		 * @param {type:"ts-table-list"} object
		 * @returns {ts.ui.TableSpirit}
		 */
		style: chained(function(config) {
			if (config && config.type) {
				this.css.add(config.type);
			}
		}),

		// Buttons and actions .....................................................

		/**
		 * Get or set the buttons.
		 * TODO: The `config` button must somehow become SPECIAL!
		 * added functionality. This is not officially documented.
		 * @param @optional {Array<object|ts.ui.ButtonModel>} json
		 * @returns {ts.ui.ButtonCollection}
		 */
		buttons: chained(function(json) {
			var model = this._model;
			var toolb = model.toolbar;
			if (arguments.length) {
				toolb.buttons = json;
			} else {
				return toolb.buttons;
			}
		}),

		/**
		 * Get or set the actions.
		 * @param {Array<Object>|ts.ui.ActionsCollection} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		actions: chained(function(json) {
			var model = this._model;
			var toolb = model.toolbar;
			if (arguments.length) {
				toolb.actions = json;
			} else {
				return toolb.actions;
			}
		}),

		// Configure ...............................................................

		/**
		 * @deprecated
		 * Show the config button.
		 * @param @optional {function} onconf
		 * @returns {ts.ui.TableSpirit}
		 */
		configurable: confirmed('(function)')(
			chained(function(onconf) {
				console.warn(String(this), 'The method `configurable` has been renamed to `configbutton`');
				return this.configbutton.apply(this, arguments);
			})
		),

		/**
		 * @deprecated
		 * Hide the config button.
		 */
		unconfigurable: chained(function() {
			console.warn(
				String(this),
				'"unconfigurable" should now be implemented via `configbutton(null)`'
			);
			return this.configbutton.apply(this, null);
		}),

		/**
		 * Get or set the collaboration button.
		 * @param {Function} [onclick]
		 * @returns {this|ts.ui.ButtonModel}
		 */
		configbutton: chained(function(onclick) {
			var toolb = this._model.toolbar;
			var value = toolb.configbutton.apply(toolb, arguments);
			if (!arguments.length) {
				return value;
			}
		}),

		// Selecting ...............................................................

		/**
		 * Make (all rows) selectable.
		 * @param @optional {function} onselect
		 * @param @optional {function} onselectall
		 * @param @optional {function} onunselectall
		 * @returns {ts.ui.TableSpirit}
		 */
		selectable: confirmed('(function)', '(function)', '(function)')(
			chained(function(onselect, onselectall, onunselectall) {
				this.tick.add((this._TICKSELECT = this.$instanceid + ':onselect'));
				this._model.selectable = true;
				this.onselect = onselect || this.onselect;
				this.onselectall = onselectall || this.onselectall;
				this.onunselectall = onunselectall || this.onunselectall;
				this._renderqueue.push(function() {
					this.css.add(CLASS_SELECTABLE);
				});
			})
		),

		/**
		 * Make (all rows) unselectable.
		 * @returns {ts.ui.TableSpirit}
		 */
		unselectable: chained(function() {
			this._model.selectable = false;
			this.onselect = null;
			this.onselectall = null;
			this.onunselectall = null;
			this._renderqueue.push(function() {
				this.css.remove(CLASS_SELECTABLE);
			});
		}),

		/**
		 * Get all selected indexes OR confirm selected indexes.
		 * @param @optional {number|Array<number>}
		 * @returns {Array<number>|boolean}
		 */
		selected: function(/* ...indexes */) {
			var model = this._model;
			if (arguments.length) {
				return makearray(arguments).every(function(index) {
					return model.rowselected(index);
				});
			} else {
				return model.selectedrows();
			}
		},

		/**
		 * Select row at index(es).
		 * @param @optional {number|Array<number>}
		 */
		select: confirmed('(number|array)')(
			chained(function(/* ...indexes */) {
				this._select(true, this._rowsadd, arguments);
			})
		),

		/**
		 * Unselect row at index(es).
		 * @param @optional {number|Array<number>}
		 */
		unselect: confirmed('(number|array)')(
			chained(function(/* ...indexes */) {
				this._select(false, this._rowsoff, arguments);
			})
		),

		/**
		 * Toggle row selection at index(es).
		 * @param @optional {number|Array<number>}
		 */
		toggle: confirmed('(number|array)')(
			chained(function(/* ...indexes */) {
				var given = arguments;
				var model = this._model;
				var indxs = given.length ? given : model.rows.map(indexes);
				makearray(indxs).forEach(function(i) {
					if (model.rowselected(i)) {
						this.unselect(i);
					} else {
						this.select(i);
					}
				}, this);
			})
		),

		// Searching ...............................................................

		/**
		 * TODO: Assign a default search model to all columns. Alternatively,
		 * this method could construct a global search field in the statusbar?
		 */
		searchable: chained(function() {
			console.error('Not implemented just yet');
		}),

		/**
		 * TODO: This.
		 */
		unsearchable: chained(function() {
			console.error('Not implemented just yet');
		}),

		// Numbered ................................................................

		/**
		 * Make (all rows) numbered.
		 * @returns {ts.ui.TableSpirit}
		 */

		numbered: confirmed('(function)')(
			chained(function() {
				this._model.numbered = true;
			})
		),

		/**
		 * Make no rows numbered, then.
		 * @returns {ts.ui.TableSpirit}
		 */
		unnumbered: confirmed('(function)')(
			chained(function() {
				this._model.numbered = false;
			})
		),

		// Clicking ................................................................

		/**
		 * Make (all cells) clickable.
		 * @param @optional {function} onclick Optionally configure `onclick`
		 * @returns {ts.ui.TableSpirit}
		 */
		clickable: confirmed('(function)')(
			chained(function(onclick) {
				this.css.add(CLASS_CLICKABLE);
				this._clickable = true;
				if (onclick) {
					this.onclick = onclick;
				}
			})
		),

		/**
		 * Make (all cells) not clickable no more.
		 * @returns {ts.ui.TableSpirit}
		 */
		unclickable: chained(function() {
			this.css.remove(CLASS_CLICKABLE);
			this._clickable = false;
		}),

		/**
		 * Make (all columns) sortable.
		 * @param @optional {function} onsort Optionally configure `onsort`
		 * @returns {ts.ui.TableSpirit}
		 */
		sortable: confirmed('(function)')(
			chained(function(onsort) {
				this._model.sortable = true;
				if (onsort) {
					this.onsort = onsort;
				}
			})
		),

		/**
		 * Make the table not sortable.
		 * @returns {ts.ui.TableSpirit}
		 */
		unsortable: chained(function() {
			this._model.sortable = false;
		}),

		/**
		 * Built-in sort mechanism.
		 * @param {number} colindex
		 * @param @optional {boolan} ascending
		 * @returns {ts.ui.TableSpirit}
		 */
		sort: chained(function(colindex, ascending) {
			var model = this._model;
			var cols = model.cols;
			var col = cols[colindex];
			if (this._model.sortable) {
				if (col) {
					if (col.sortable) {
						if (Type.isBoolean(ascending)) {
							col.ascending = ascending;
						}
						model.sort(col);
						this.tick.next(function ifnotmanuallyclicked() {
							col.selected = true;
						});
					}
				} else {
					throw new Error('Could not sort column at ' + colindex + '. Does it exist?');
				}
			} else {
				throw new Error('Table must be sortable()');
			}
		}),

		/**
		 * Built-in search mechanism. If the rows have not been
		 * compiled into observable models, we'll force repaint.
		 * @param {number} colindex
		 * @param {string} value
		 * @returns {ts.ui.TableSpirit}
		 */
		search: chained(function(colindex, value) {
			var model = this._model;
			model.search(colindex, value);
			this._resetpager();
			this._resetscrolling();
			if (!model.compiled) {
				model.$dirty();
			}
		}),

		/**
		 * EDBML rendering done.
		 * @param {TODO!} summary
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
			this._layouteverything();
			if (summary.first) {
				// lock keyboard navigation to rows (when editing)
				if (!this.attention.trapping) {
					this.attention.trap(this.queryplugin.getrows());
				}
			}
			// this should really be `onbeforerender` (when we have that)
			if (this._rowsmutated) {
				this._rowsmutated = false;
				var first = this._model.firstVisibleRow();
				var index = first ? first.$index : 0;
				this._bestpage(index);
			}
		},

		// Editing .................................................................

		/**
		 * Make all cells editable with an optional callback.
		 * TODO(jmo@): Make sure that we `vflex` when this is done at any time!
		 * @param @optional {function} onedit
		 * @returns {ts.ui.TableSpirit}
		 */
		editable: confirmed('(function)')(
			chained(function(onedit) {
				var model = this._model;
				model.editable = true;
				this.editorplugin.init(true);
				if (onedit) {
					this.onedit = onedit;
				}
			})
		),

		/**
		 * Make everything not editable.
		 * @returns {ts.ui.TableSpirit}
		 */
		uneditable: chained(function() {
			this.editorplugin.init(false);
			this._model.editable = false;
			this.onedit = null;
		}),

		/**
		 * Focus editable cell.
		 * TODO: Fail if not editable.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 * @returns {ts.ui.TableSpirit}
		 */
		focus: chained(function(rowindex, cellindex) {
			if (this._model.editable) {
				this.editorplugin.focus(rowindex, cellindex);
			} else {
				throw new Error('Cannot focus non-editable Table');
			}
		}),

		// Status ..................................................................

		/**
		 * Show a message in the statusbar.
		 * TODO: Once we have (complex) translations in place, consider showing a
		 * default statusmessage (at least on desktop) "showing 1-23 of 2300 items".
		 * @param @optional {string} message
		 * @returns {string|ts.ui.TableSpirit}
		 */
		status: chained(function(message) {
			var toolbar = this._model.toolbar;
			if (arguments.length) {
				this._statusmessage = message;
				if (!this._errormessage) {
					toolbar.status = message;
				}
			} else {
				return toolbar.status;
			}
		}),

		// Linking .................................................................

		/**
		 * The table supports markdown out of the box, but you'll need to call
		 * this in order to support the link syntax; just so that you are aware
		 * that you expose a surface for phishing attacks.
		 * @param @optional {function} onlink
		 * @returns {ts.ui.TableSpirit}
		 */
		linkable: confirmed('(function)')(
			chained(function(onlink) {
				this._model.linkable = true;
				if (arguments.length) {
					this.onlink = onlink;
				}
			})
		),

		/**
		 * Make the table not support links no more.
		 * @returns {ts.ui.TableSpirit}
		 */
		unlinkable: chained(function() {
			this._model.linkable = false;
		}),

		// Collaboration ...........................................................

		/**
		 * Get or set the collaboration button.
		 * @param {Function} [onclick]
		 * @returns {this|ts.ui.ButtonModel}
		 */
		collabbutton: chained(function(onclick) {
			var toolb = this._model.toolbar;
			var value = toolb.collabbutton.apply(toolb, arguments);
			if (!arguments.length) {
				return value;
			}
		}),

		// Privileged ..............................................................

		/**
		 * If not zero, the Table height will be fixed to
		 * show this many standard rows where "standard"
		 * rows are assumed to be single line (no wraps).
		 * @type {number}
		 */
		$fixedsize: 0,

		/**
		 * Override the statusbar message to show a validation error or something.
		 * @param {string|null} message
		 */
		$errormessage: function(message) {
			var toolbar = this._model.toolbar;
			if (message) {
				toolbar.title = this._errormessage = message;
			} else {
				if (this._errormessage) {
					toolbar.title = this._statusmessage || '';
					this._errormessage = null;
				}
			}
		},

		// Loading .................................................................

		/**
		 * @param {string|boolean} [arg]
		 * @returns {this}
		 */
		busy: chained(function(arg) {
			if (this._ismaximized() || this.queryplugin.getbody()) {
				this.super.busy(arg);
			}
		}),

		/**
		 * The Table should or does show a "floating gutter" that stys
		 * fixed on horizontal scrolling (to make row selection easier)?
		 * Note that `ts-scroll-x` was added by the {TableLayoutPlugin}.
		 * @returns {boolean}
		 */
		$floatgutter: function() {
			return this._model.selectable && this.css.contains('ts-scroll-x');
		},

		// Private .................................................................

		/**
		 * Private tick.
		 * @type {string}
		 */
		_TICKSELECT: null,

		/**
		 * Table model.
		 * @type {ts.ui.TableModel}
		 */
		_model: null,

		/**
		 * Ad hoc action queue: Push functions to this
		 * list and they will be evaluated at `onrender`.
		 * This to make sure that we repaint only once.
		 * @type {Array<function>}
		 */
		_renderqueue: null,

		/**
		 * Row scrolling measured.
		 * @type {Position}
		 */
		_scroll: null,

		/**
		 * Don't measure scrolling while this is true.
		 * @type {boolean}
		 */
		_noscrolling: false,

		/**
		 * @type {number}
		 */
		_target: -1,

		/**
		 * We crated the current pager for ourselves?
		 * Otherwise someone else handles pagination.
		 * Set to `false` once the custom is assigned.
		 * @type {boolean}
		 */
		_ownpager: true,

		/**
		 * Hotfixing a problem where Chrome and Safari
		 * resets the scroll position of rows whenever
		 * the HTML is updated by the EDBML engine.
		 * TODO: Is this a general problem or what?
		 * @type {boolean}
		 */
		_scrollfixing: Client.isWebKit,

		/**
		 * Tracking all newly selected rowindexes
		 * (no models, so no observers for free).
		 * @type {Array<number>}
		 */
		_rowsadd: null,

		/**
		 * Tracking newly unselected rowindexes.
		 * @type {Array<number>}
		 */
		_rowsoff: null,

		/**
		 * This can be anything, but usually
		 * it's either `paging` or `sorting`.
		 * @type {string}
		 */
		_flag: null,

		/**
		 * Tracking the statusbar message.
		 * @type {string}
		 */
		_statusmessage: null,

		/**
		 * Tracking the error message.
		 * @type {string}
		 */
		_errormessage: null,

		/**
		 * Button or Switch or something was triggered.
		 * @param {ts.ui.Spirit} spirit
		 * @param {function|null} action
		 */
		_onextra: function(action, spirit /* ...rest */) {
			var name,
				value,
				elm = spirit.element;
			if (Type.isFunction(action)) {
				var args = gui.Array.from(arguments).slice(2);
				var posi = this.queryplugin.getpos(elm);
				if ((name = elm.getAttribute('name'))) {
					if ((value = elm.getAttribute('value'))) {
						value = Type.cast(value);
						if (Type.isString(value)) {
							value = ConfigPlugin.jsonvaluate(value);
						}
					}
					action.apply(this, [name, value || undefined].concat(args).concat([posi.y, posi.x]));
				}
			}
		},

		/**
		 * True when the Table is exploded (maximized) and configured to
		 * adjust the rowcount and pagecount for optimal fit on screen.
		 * @type {boolean}
		 */
		_autooptimize: false,

		/**
		 * Do some DHTML whenever the EDBML has updated
		 * and also after the window has been resized.
		 * TODO: Precompute if or not all this is needed!
		 * TODO: If the table is display:none while this
		 * happens, figure out some kind of desperate thing.
		 */
		_layouteverything: function() {
			var model = this._model;
			if (this._crashproof()) {
				this.layoutplugin.layout(this, model);
				this._clip(this.queryplugin.getguts(true));
				this.layoutplugin.flex(this, model);
			}
			this._flush();
			this._cnames(model, model.cols, model.rows, model.toolbar);
			this._togglegutter(model);
		},

		/**
		 * The Table needs to render *before* we can determine if the floating
		 * gutter needs to be displayed  (because this all depends on the final
		 * computed size of the table columns and stuff). If we can determine
		 * that is should be shown or hidden, and if this is different from
		 * the previous rendering, we will now trigger another re-rendering :/
		 * but at least now, we will not render extra checkboxes that might
		 * confuse Selenium tests even though they are invisible to the user.
		 * @param {ts.ui.TableModel} model
		 */
		_togglegutter: function(model) {
			model.floatinggutter = this.$floatgutter();
		},

		/**
		 * We know that if the rows are `display:none` or something,
		 * the layout calculations will freeze the browser so bad.
		 * @returns {boolean}
		 */
		_crashproof: function() {
			var rows = this.queryplugin.getrows();
			return !rows || !!rows.offsetHeight;
		},

		/**
		 * Is maxed layout?
		 * @returns {boolean}
		 */
		_ismaximized: function() {
			return this.css.contains('ts-maximized');
		},

		/**
		 * TODO: No models no more!
		 */
		_clearrows: function(model) {
			var rows = model.rows;
			if (model.compiled) {
				this._observerows(false);
				model.compiled = false;
				rows.clear();
			}
			return rows;
		},

		/**
		 * Update selection.
		 * @param {boolean} select
		 * @param {Array<number>} collect
		 * @param {Arguments} args
		 */
		_select: function(select, collect, args) {
			var model = this._model;
			var alles = !args.length;
			var indxs = alles ? model.rows.map(indexes) : args;
			var changed = makearray(indxs).filter(function(i) {
				return select ? model.selectrow(i) : model.unselectrow(i);
			});
			if (changed.length) {
				if (this.onselect) {
					collect.push.apply(collect, changed);
					this.tick.dispatch(this._TICKSELECT);
				}
			}
		},

		/**
		 * Select everything. This might toogle two billion booleans
		 * and convert two billion arrays into objects (when rows are
		 * declared with compact syntax), so we'll render in two steps:
		 * First update what you see on the screen, then update for real.
		 * (not needed on select because the page is now already selected).
		 */
		_selectall: function(on) {
			if (on === false) {
				this._unselectfast();
				this.tick.time(function unfreeze() {
					this.unselect();
				});
			} else {
				this.select();
			}
		},

		/**
		 * Update page selection using raw DHTML for instant feedback before the
		 * model gets updated for real. This way, we also make sure that `onselect`
		 * is not called more than once (first for the page, then for the rest),
		 * because otherwise we would probably just call `_selectpage(false)`.
		 */
		_unselectfast: function(on) {
			var path = '.ts-table-checkbox button';
			var guts = this.queryplugin.getguts(true);
			var menu = this.queryplugin.getmenu(true);
			var buts = guts ? guts.dom.qall(path) : [];
			var butt = menu.dom.qall(path);
			buts
				.concat(butt)
				.map(function(but) {
					return but.querySelector('i');
				})
				.forEach(function(icon) {
					icon.className = ICON_OFF;
				});
		},

		/**
		 * Select visible rows (only).
		 * @param @optional {boolean} on
		 */
		_selectpage: function(on) {
			var page = this._model.visibleRows();
			var idxs = page
				.filter(function(row) {
					return row.selectable !== false;
				})
				.map(function(row) {
					return row.$index;
				});
			if (on === false) {
				this.unselect(idxs);
			} else {
				this.select(idxs);
			}
		},

		/**
		 * Create default pager and handle page selection.
		 * Optionally, the pager may be specified by users.
		 * In that case, make sure we never overwrite it.
		 * @param @optional {object|ts.ui.PagerModel} json
		 */
		_createpager: function(json) {
			var model = this._model;
			var toolbar = model.toolbar;
			var oldpager = toolbar.pager;
			var newpager = null;
			if (arguments.length) {
				newpager = this._createcustompager(json);
			} else if (this._ownpager) {
				newpager = this._createownpager(model, this);
			}
			if (newpager) {
				toolbar.pager = newpager;
				this._maxpages();
				if (oldpager) {
					oldpager.dispose();
				}
			}
		},

		/**
		 * Crate custom pager.
		 * @param {object|ts.ui.PagerModel} json
		 * @returns {ts.ui.PagerModel}
		 */
		_createcustompager: function(json) {
			return PagerModel.from(json);
		},

		/**
		 * Create my own pager.
		 * @param {ts.ui.TableModel} model
		 * @param {ts.ui.TableSpirit} spirit
		 * @returns {ts.ui.PagerModel}
		 */
		_createownpager: function(model, spirit) {
			return PagerModel.from({
				page: 0,
				pages: model.pageCount(),
				onselect: function(index) {
					spirit._pageselected(index);
				}
			});
		},

		/**
		 * Simply take control of the `max` property on the
		 * pager even if the user has assigned a custom one:
		 * Show three steps when small, otherwise five steps.
		 */
		_maxpages: function() {
			var pager = this._model.toolbar.pager;
			if (pager) {
				var width = this.box.width;
				pager.max = width < 600 ? 3 : 5;
			}
		},

		/**
		 * Reset the pager (if it's our own pager).
		 */
		_resetpager: function() {
			var model = this._model;
			var pager = this.pager();
			if (this._ownpager && model.maxrows) {
				pager.pages = model.pageCount();
				pager.page = 0;
			}
		},

		/**
		 * Setup to reset vertical scrolling after repaint.
		 * This is relevant when either paging or sorting.
		 */
		_resetscrolling: function() {
			this._renderqueue.push(function resetscrolling() {
				var rows = this.queryplugin.getrows();
				if (rows) {
					rows.scrollTop = 0;
				}
			});
		},

		/**
		 * Perhaps pagination was recalculated because of
		 * window resize, perhaps not, this will handle it.
		 * param {number} index
		 */
		_pageselected: function(index) {
			this._model.page = index;
			if (this._resizing) {
				this._resizing = false;
			} else {
				this._target = -1;
			}
			if (this.script.suspended) {
				this.script.unsuspend();
				this.script.run();
			}
			if (this.onpage) {
				this.onpage.call(this, index);
			}
		},

		/**
		 * Set the pager to show the row of given index.
		 * The row might be located anywhere on that page.
		 * @param {number} index
		 */
		_bestpage: function(index) {
			var model = this._model;
			var pager = this.pager();
			if (pager) {
				pager.pages = model.pageCount();
				pager.page = model.getPage(index);
			}
		},

		/**
		 * Something was clicked.
		 * @param {Element} elm
		 * @param {Event} e
		 */
		_onclick: function(elm, e) {
			var model = this._model;
			if (model.menuopen) {
				this._specialclick(elm, e);
			} else {
				this._regularclick(elm);
			}
		},

		/**
		 * Something was clicked while the selection menu is open.
		 * @param {Element} elm
		 * @param {Event} e
		 */
		_specialclick: function(elm, e) {
			var menu = this.queryplugin.getmenu();
			if (this._contains(menu, elm)) {
				this._onmenuclick(elm);
				e.stopPropagation();
			} else {
				this._openmenu(false);
			}
		},

		/**
		 * Something was clicked and selection menu is closed.
		 * @param {Element} elm
		 */
		_regularclick: function(elm) {
			var model = this._model;
			var edits = this._editable(model);
			if (model.sortable || model.selectable) {
				var cols = this.queryplugin.getcols();
				if (this._contains(cols, elm)) {
					this._oncolsclick(elm, model);
				}
			}
			if ((this._clickable && this.onclick) || edits) {
				var rows = this.queryplugin.getrows();
				if (elm.nodeName !== 'TBODY' && this._contains(rows, elm)) {
					this._onrowsclick(elm, edits);
				}
			}
			if (model.selectable) {
				if (Client.isEdge && elm.className.startsWith('ts-icon-checkbox')) {
					elm = elm.parentNode; // `pointer-events:none` ignored in Edge 14 :/
				}
				if (CSSPlugin.contains(elm, CLASS_SELECTBUTTON)) {
					this._ongutsclick(elm);
				} else if (this._contains(this.queryplugin.getmenu(), elm)) {
					this._onmenuclick(elm);
				}
			}
		},

		/**
		 * Something is editable?
		 * @param {ts.ui.TableModel} model
		 * @returns {boolean}
		 */
		_editable: function(model) {
			return (
				model.editable &&
				model.cols.some(function(col) {
					return col.editable !== false;
				})
			);
		},

		/**
		 * Compute the target row: When the window resizes, we like to show
		 * the first visible row again after pagination reflow. Now, if the
		 * window resizes yet again, we like to stick to this original row.
		 * @param {ts.ui.TableModel} model
		 */
		_onbeforeresize: function(model) {
			if (this._autooptimize && this._ownpager && this._target === -1) {
				var first = model.firstVisibleRow();
				var index = first ? first.$index : 0;
				this._target = index > 0 ? index : -1;
			}
		},

		/**
		 * DHTML updates after window resize.
		 * Compute new best page in the pager.
		 * @param {number} index Target rowindex
		 */
		_onafterresize: function(index) {
			this._layouteverything();
			this._hackscrolling();
			if (this._autooptimize) {
				this.max();
				if (this._ownpager && index > -1) {
					this._resizing = true;
					this.script.suspend();
					this._bestpage(index);
				} else {
					var model = this._model;
					var pager = this.pager();
					if (this._ownpager && model.maxrows) {
						pager.pages = model.pageCount();
					}
				}
			}
			this._maybecallresize();
		},

		/**
		 * Call `onresize` if and when it is defined
		 * and not previously called with same value.
		 * @param {Function} [onresize] Define it now
		 */
		_maybecallresize: function(onresize) {
			if ((this.onresize = onresize || this.onresize)) {
				var max = this._calcmax();
				if (this.onresize.__last !== max) {
					this.onresize.call(this, max);
					this.onresize.__last = max;
				}
			}
		},

		/**
		 * Claimed parent contains child?
		 * @param {Element} parent
		 * @param {Element} child
		 * @returns {boolean}
		 */
		_contains: function(parent, child) {
			return parent && DOMPlugin.contains(parent, child);
		},

		/**
		 * Element classList contains classname?
		 * @param {Element} elm
		 * @param {string} classname
		 */
		_hasclass: function(elm, classname) {
			return elm && CSSPlugin.contains(elm, classname);
		},

		/**
		 * Fix columns to rows position. Snapshot the position so that we can
		 * restore it after EDBML updates, which might sometimes ruin it all.
		 * @param {number} x
		 * @param {number} y
		 * @param {ts.ui.Spirit} cols
		 * @param {ts.ui.Spirit} guts
		 */
		_onscroll: function(x, y, cols, guts) {
			this._scroll.x = x;
			this._scroll.y = y;
			if (cols) {
				cols.sprite.x = 0 - x;
			}
			if (guts) {
				guts.sprite.y = 0 - y;
			}
		},

		/**
		 * Patching a dysfunction in WebKit where scroll position
		 * gets reset after HTML is updated by the EDBML engine.
		 * TODO(jmo@): Move this to the {ts.ui.TableLayoutPlugin}
		 */
		_hackscrolling: function() {
			var plug = this.queryplugin;
			var rows = plug.getrows();
			var cols = plug.getcols(true);
			var guts = plug.getguts(true);
			this._clip(guts);
			if (rows && cols) {
				this._onscroll(rows.scrollLeft, rows.scrollTop, cols, guts);
			}
		},

		/**
		 * The gutter is floated on top of the rows and synchronized
		 * to the scrolling of the rows (this so that the gutter can
		 * stay fixed upon horizontal scrolling). Unfortunately, the
		 * CSS can't handle a situation where the gutter appears on
		 * top of the bottom toolbar. Since Firefox doesn't support
		 * nice clip-path just yet, we'll fix it with some DHTML.
		 * Note that this can only possibly perform on mobiles
		 * because the scrollbar size is zero (so nothing happens).
		 * TODO(jmo@): Move this into a (future) SelectionPlugin.
		 * @param {ts.ui.Spirit} guts
		 */
		_clip: function(guts) {
			var bsize = Client.scrollBarSize;
			if (guts && bsize) {
				var avail = this.queryplugin.getbody().offsetHeight;
				var scrol = this.queryplugin.getrows().scrollTop;
				guts.css.maxHeight = avail + scrol - bsize;
			}
		},

		/**
		 * Cols clicked. Call `onsort` with column index and ascending flag.
		 * If the same button is clicked twice, reverse ascending/descending.
		 * Note: the `selected` property is maintained by {ts.ui.TableModel}.
		 * @param {Element} elm
		 * @param {ts.ui.TableModel} model
		 */
		_oncolsclick: function(elm, model) {
			if ((elm = ButtonSpirit.getButton(elm, this))) {
				var length = model.rows.length;
				if (model.sortable) {
					if (this._hasclass(elm, 'ts-button-sort')) {
						var i = this.queryplugin.getindex(elm);
						var c = model.cols[i];
						if (c.sortable) {
							if (c.selected) {
								c.ascending = !c.ascending;
							}
							if (this.onsort) {
								perfwarning(length > 3000);
								this.onsort(i, c.ascending);
							}
							this._selectcol(c);
							this._flag = 'sorting';
							this._resetscrolling();
						}
					}
				}
			}
		},

		/**
		 * Select the column (unselect other columns).
		 * @param {ts.ui.TableColModel} col
		 */
		_selectcol: function(col) {
			this._model.cols.forEach(function(c) {
				c.selected = c === col;
			});
		},

		/**
		 * Rows clicked. If defined, call `onclick` with rowindex and cellindex.
		 * TODO: Definitely move this method elsewhere...
		 * @param {Element} elem
		 * @param {boolean} editable
		 */
		_onrowsclick: function(elem, editable) {
			var area,
				pos = this.queryplugin.getpos(elem);
			if (pos) {
				// abort when non-floating gutter is clicked
				if (this.onclick) {
					this.onclick(pos.y, pos.x);
				}
				if (editable) {
					while (elem.localName !== 'td') {
						elem = elem.parentNode;
					}
					if ((area = elem.querySelector('.' + CLASS_TEXTAREA))) {
						area.focus();
					}
				}
			}
		},

		/**
		 * Gutter clicked. Update (single) row selection.
		 * @param {Element} elm
		 * @param {HTMLDivElement} guts
		 */
		_ongutsclick: function(elm) {
			elm = ButtonSpirit.getButton(elm);
			this.toggle(this.queryplugin.getindex(elm));
		},

		/**
		 * The top-left checkbox-button was clicked. Either open the
		 * selection menu or clear all selections in the whole world.
		 * @param {HTMLAsideElement} menu
		 * @param {Element} elm
		 */
		_onmenuclick: function(elm) {
			if ((elm = ButtonSpirit.getButton(elm))) {
				switch (this.queryplugin.getaction(elm)) {
					case 'selection-menu':
						if (this._maybeclearall()) {
							if (this.onunselectall) {
								this.onunselectall.call(this);
							}
						} else {
							this._openmenu(true);
							this._selectpage();
							var pages = this._haspages();
							if (this.onselectall && !pages) {
								this.onselectall.call(this);
							}
						}
						break;
					case 'selection-menu-close':
						this._openmenu(false);
						break;
					case 'select-page':
						this._openmenu(false);
						break;
					case 'select-all':
						this._openmenu(false);
						this._renderqueue.push(function menuclosed() {
							this._selectall();
							if (this.onselectall) {
								this.onselectall();
							}
						});
						break;
				}
			}
		},

		/**
		 * The menu works in a peculiar way: If there are any selected
		 * rows on the current page, clicking the menu will clear all
		 * selections in the table. If there are no selections on the
		 * page, the whole page will be selected and the menu opens.
		 * This will determine the outcome.
		 * @returns {boolean} True on clear all
		 */
		_maybeclearall: function(hasselections) {
			if (this._model.isVisibleRowSelected()) {
				this.event.remove('click', document);
				this._openmenu(false);
				this._selectall(false);
				this._model.$dirty();
				return true;
			}
			return false;
		},

		/**
		 * Open or close the selection menu. We'll ask the Pager whether
		 * or not there are multiple pages because the dev might render
		 * one page at a time while in the database there are millions;
		 * and in that case, he will have created a Pager to reflect it.
		 * @param {boolean} open
		 */
		_openmenu: function(open) {
			var pages = this._haspages();
			if (pages && open !== this._model.menuopen) {
				this._model.menuopen = open;
				this.tick.time(function() {
					this.event.shift(open, 'click', document);
				});
			}
		},

		/**
		 * Check the table has pages or not
		 * @returns {boolean}
		 */
		_haspages: function() {
			var model = this._model;
			var toolb = model.toolbar;
			var pager = toolb.pager;
			return pager && pager.pages > 1;
		},

		/**
		 * DHTML updates will mess with the scrolling.
		 * This suspends scroll measurements while the
		 * DHTML is updating (so we can restore scroll).
		 * TODO: This as standard in {edb.ScriptPlugin},
		 * for now we call the method directly from EDBML.
		 * @see {ts.ui.TableSpirit.edbml}
		 */
		_onbeforerender: function() {
			var rows = this.queryplugin.getrows();
			if (rows) {
				this._noscrolling = true;
			}
		},

		/**
		 * Autotatically adjust maxrows to fit
		 * in the Tables embedding container
		 * and then return this number of rows.
		 * @returns {number}
		 */
		_automax: function() {
			return (this._model.maxrows = this._calcmax());
		},

		/**
		 * Calculate maxrows to fit in container.
		 * Some overflow (scrollbar) is expected.
		 * @returns {number}
		 */
		_calcmax: function() {
			var tablebody = this.queryplugin.getbody();
			var availsize = tablebody.offsetHeight;
			var rowheight = UNIT_DOUBLE;
			var rowslimit = Math.ceil(availsize / rowheight);
			return rowslimit;
		},

		/**
		 * Flush the action queue. This apparently
		 * needs a tick for the screen to repaint.
		 */
		_flush: function() {
			this.tick.next(function onrepaint() {
				var list = this._renderqueue;
				while (list.length) {
					list.shift().call(this);
				}
			});
		},

		/**
		 * Update some classnames. Nothing fancy.
		 * @type {ts.ui.TableModel} model
		 * @type {ts.ui.TableColCollection} cols
		 * @param {ts.ui.TableRowCollection} rows
		 * @param {ts.ui.ToolBarModel} toolbar
		 */
		_cnames: function(model, cols, rows, toolbar) {
			var show = !cols.length || cols.some(visible);
			this.css.shift(rows.length && show, 'ts-hasrows');
			this.css.shift(cols.length && show, 'ts-hascols');
		}
	});
})(
	gui.Type,
	gui.Client,
	gui.Array,
	gui.DOMPlugin,
	gui.CSSPlugin,
	gui.ConfigPlugin,
	gui.Position,
	gui.Combo.chained,
	gui.Arguments.confirmed,
	ts.ui.TableRowModel,
	ts.ui.ButtonSpirit,
	ts.ui.PagerModel,
	ts.ui.UNIT_DOUBLE
);
