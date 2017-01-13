/**
 * Table layout and flexiness.
 * @extends {ts.ui.Plugin}
 * @using {gui.Client} Client
 * @using {gui.Tick} Tick
 */
ts.ui.TableLayoutPlugin = (function using(Client, Tick) {
	var UNIT = 22;
	var UNIT_DOUBLE = UNIT * 2;
	var UNIT_TRIPLE = UNIT * 3;
	var COL_CELLS = '.ts-table-cols th:not(.ts-table-addition)';
	var ROW_CELLS = '.ts-table-rows tr:first-child td:not(.ts-table-addition)';

	/**
	 * @param {Element} elm
	 * @returns {number}
	 */
	function getheight(elm) {
		return elm.getBoundingClientRect().height;
	}

	/**
	 * TODO(jmo@): Only fix the height of editable cells!
	 * @param {HTMLTableCellElement} td
	 * @param {number} height
	 */
	function setheight(td, height) {
		var div = td.querySelector('.ts-table-cell');
		if (div) {
			div.style.height = height + 'px';
		}
	}

	/**
	 * Cells in this column may span multiple lines? Because
	 * otherwise the `style.height` setters are not needed.
	 * @param {ts.ui.TableColModel} col
	 * @returns {boolean}
	 */
	function ismultiline(col) {
		return col.wrap && col.visible;
	}

	return ts.ui.Plugin.extend({

		/**
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 */
		layout: function(spirit, model) {
			var plug = spirit.queryplugin;
			var cols = plug.getcols();
			var rows = plug.getrows();
			var guts = plug.getguts();
			this._layout1(spirit, model, cols, rows, guts);
			this._layout2(spirit, model.cols);
		},

		/**
		 * Flex all the things.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 */
		flex: function(spirit, model) {
			this._hflex(spirit, model);
			if (model.cols.some(ismultiline)) {
				this._vfix(spirit, model);
			}
		},

		// Private .................................................................

		/**
		 * Restore scroll positions after EDBML update (might have) ruined it.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 * @param {HTMLDivElement} cols
		 * @param {HTMLDivElement} rows
		 * @param {HTMLDivElement} guts
		 */
		_layout1: function(spirit, model, cols, rows, guts) {
			spirit.event.add('scroll', rows); // TODO: WHAT ABOUT THIS?
			var fixed = model.maxrows && spirit.$fixedsize;
			rows.style.height = fixed ? (UNIT_DOUBLE * model.maxrows) + 'px' : '';
			if (model.isWrapping()) {
				cols.style.paddingRight = Client.scrollBarSize + 'px';
			}
			Tick.nextFrame(function() {
				this._layoutasync(spirit, model, rows, guts, spirit._flag);
				spirit._hackscrolling();
				spirit._flag = null;
			}, this);
		},

		/**
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableColCollection} cols
		 */
		_layout2: function(spirit, cols) {
			spirit.css.shift(cols.some(function(col) {
				return col.wrap;
			}), 'ts-wrapping');
		},

		/**
		 * Table updates reset the scroll position asynchronously
		 * so that this operation needs to be performed later on.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 * @param {HTMLDivElement} rows
		 * @param {HTMLDivElement} guts
		 * @param {string} flag
		 */
		_layoutasync: function(spirit, model, rows, guts, flag) {
			var x = spirit._scroll.x;
			var y = spirit._scroll.y;
			if (rows) {
				switch (flag) {
					case 'paging':
					case 'sorting':
						y = 0;
						break;
				}
				rows.scrollLeft = x;
				rows.scrollTop = y;
			}
			Tick.time(function() {
				spirit._noscrolling = false;
			});
		},

		// Horizontal flex .........................................................

		/**
		 * Release it, measure it, flex it, then fix it again.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 */
		_hflex: function(spirit, model) {
			spirit.css.width = 'auto';
			var cols = model.visibleCols();
			var ths = spirit.dom.qall(COL_CELLS);
			var tds = spirit.dom.qall(ROW_CELLS);
			var width = spirit.box.width;
			this._hflex1(spirit, model, width, cols, ths, tds);
			spirit.css.width = width;
			this._hflex3(spirit, model, width, cols, ths, tds);
		},

		/**
		 * Flex step one.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 * @param {number} width
		 * @param {Array<ts.ui.TableColModel>} cols
		 * @param {Array<HTMLTableCellElement>} ths
		 * @param {Array<HTMLTableCellElement>} tds
		 */
		_hflex1: function(spirit, model, width, cols, ths, tds) {
			var total = this._hflextotal(cols);
			var adjust = this._hflexadjust(model);
			var correct = (width - adjust) / total;
			var sum = this._hflex2(cols, ths, tds, correct);
			spirit.css.shift(sum + adjust > width, 'ts-scroll-x');
		},

		/**
		 * Flex step two.
		 * @param {Array<ts.ui.TableColModel>} cols
		 * @param {Array<HTMLTableCellElement>} cells
		 * @param {number} xxxxx
		 */
		_hflex2: function(cols, ths, tds, xxxxx) {
			return cols.reduce(function(sum, col, i) {
				var td, th, flex = col.flex;
				var span = flex * xxxxx;
				var mins = col.minwidth;
				if (mins && span < mins) {
					span = mins;
				}
				if ((th = ths[i])) {
					th.style.width = span + 'px';
				}
				if ((td = tds[i])) {
					td.style.width = span + 'px';
				}
				return sum + span;
			}, 0);
		},

		/**
		 * First we flex and then we minwidth. We should probably do it
		 * the other way around, because the flex should account for the
		 * minwidth, but it's easier now to simply flex *again* with
		 * a new width (accounting for how much "too big" the table
		 * has now become). The variable `STRANGE_NUMBER` seems to make
		 * it work as expected, but not really sure why this is needed.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 * @param {number} width
		 * @param {Array<ts.ui.TableColModel>} cols
		 * @param {Array<HTMLTableCellElement>} ths
		 * @param {Array<HTMLTableCellElement>} tds
		 */
		_hflex3: function(spirit, model, width, cols, ths, tds) {
			if (model.rows.length) {
				var rows = spirit.queryplugin.getrows();
				var result = rows.scrollWidth;
				var STRANGE_NUMBER = 63; // strange number!
				if (result > width) {
					width = width - (result - width) - STRANGE_NUMBER;
					this._hflex1(spirit, model, width, cols, ths, tds);
				}
			}
		},

		/**
		 * Compute summed flex values.
		 * @param {Array<ts.ui.TableColModel} cols
		 * @returns {number}
		 */
		_hflextotal: function(cols) {
			return cols.reduce(function(sum, col) {
				return sum + col.flex;
			}, 0);
		},

		/**
		 * Compute width calc adjustment.
		 * @param {ts.ui.TableModel} model
		 * @returns {number}
		 */
		_hflexadjust: function(model) {
			var adjust = model.selectable ? UNIT_DOUBLE : 0;
			if (model.isWrapping() && model.maxrows) {
				adjust += Client.scrollBarSize;
			}
			return adjust;
		},

		// Vertical fix ............................................................

		/**
		 * Weirdly match the height of DIVS (inside cells) to the height of
		 * the containing row (tallest cell) because that's the only way we
		 * could figure out how to get the layout working with all the
		 * table-bugs in various browsers.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 */
		_vfix: function(spirit, model) {
			var floats = spirit._floatgutter();
			var edits = model.editable;
			var plug = spirit.queryplugin;
			if (floats || edits) {
				this._vfix2(
					plug.getrows(true),
					plug.getguts(true),
					floats, edits
				);
			}
		},

		/**
		 * Classname will make all the cells `auto` height while
		 * we measure the natural dimensions of the table members.
		 * @param {HTMLDivElement} rows
		 * @param {HTMLDivElement} guts
		 * @param {boolean} floats
		 * @param {boolean} edits
		 */
		_vfix2: function(rows, guts, floats, edits) {
			var klass = 'ts-table-vfix';
			rows.css.add(klass);
			this._vfix3(rows, guts, floats, edits);
			rows.css.remove(klass);
		},

		/**
		 * Match cell height of "floating gutter" to the main (nonfloating) cells.
		 * Also, while editing, match height of all cells to the tallest cell so
		 * that the `textarea` can span the entire cell vertically. It has to work
		 * like that because you cannot dynamically set `focus` on touch devices.
		 * TODO: Fix the browser specific CSS in the CSS :/
		 * @param {HTMLDivElement} rows
		 * @param {HTMLDivElement} guts
		 * @param {boolean} floats
		 * @param {boolean} edits
		 */
		_vfix3: function(rows, guts, floats, edits) {
			rows = rows.dom.qall('tr');
			guts = floats ? guts.dom.qall('tr') : null;
			rows.map(function readheight(row, index) {
				var border = index ? 1 : (Client.isGecko ? 1 : 0);
				var height = getheight(row) - border;
				return height;
			}).forEach(function writeheight(height, index) {
				var row = rows[index];
				if (floats) {
					setheight(guts[index], height);
				}
				if (edits) {
					Array.forEach(row.cells, function(td) {
						setheight(td, height);
					});
				}
			});
		}

	});
}(gui.Client, gui.Tick));
