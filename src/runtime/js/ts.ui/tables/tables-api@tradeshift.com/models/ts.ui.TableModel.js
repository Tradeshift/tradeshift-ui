/**
 * Advanced table model.
 * @extends {ts.ui.Model}
 * @using {ts.ui.TableRowCollection} RowCollection
 * @using {gui.Type} Type
 * @using {ts.ui.Model} Model
 */
ts.ui.TableModel = (function using(RowCollection, Type, Model) {
	/**
	 * Something is visible? Optimized for non-yet-moddeled JSON thing.
	 * @param {JSONObject|ts.ui.TableColModel|ts.ui.TableRowModel} thing
	 * @returns {boolean}
	 */
	function isvisible(thing) {
		return thing.visible !== false;
	}

	/**
	 * Exception on using `null` as cell content.
	 * @param {object|string|number|boolean} thing
	 * @returns {boolean}
	 */
	function validcell(thing) {
		var is = thing !== undefined && thing !== null;
		if (!is) {
			console.error('Cell content cannot be of type ' + Type.of(thing));
		}
		return is;
	}

	/**
	 * Table input may be in object and/or array format.
	 * This will "normalize" the input to object format
	 * so that we don't have to account for both in all
	 * scenarios (for example in the EDBML rendering).
	 * @param {Array|object} x
	 * @param @optional {number} i (internal use)
	 * @returns {ts.ui.TableRowModel}
	 */
	function rowify(x, i) {
		if (Array.isArray(x)) {
			x = {
				cells: x,
				selected: !!x.selected
			};
		}
		x.cells = x.cells.map(cellify);
		if (i !== undefined) {
			x.$index = i;
		}
		return x;
	}

	/**
	 * Normalize cell format for various (internal) purposes.
	 * TODO: validate object-with-value-property
	 * @param {object|string|number|boolean} x
	 * @param @optional @internal {number} i (internal use)
	 * @returns {object}
	 */
	function cellify(x, i) {
		if (validcell(x)) {
			if (primitive(x)) {
				x = {
					value: x,
					text: String(x)
				};
			} else {
				// TODO: validate object-with-value-property
			}
			if (!Model.is(x)) {
				x.valid = x.valid !== false;
				x.message = x.message || null;
			}
			if (i !== undefined) {
				x.$index = i;
			}
		}
		return x;
	}

	/**
	 * If the cell contains a JSON object and the object has an `item` property,
	 * we will convert it into the corresponding model. The model instance will
	 * replace the JSON object so the this conversion is permanent. Note that
	 * the conversion happens as table cells are being rendered in the *view*,
	 * ie. we don't convert everything at once (for performance in big data).
	 * @param {ts.ui.TableModel} table
	 * @param {Array<object>} row (rowified into objects)
	 */
	function modelify(table, row) {
		var ModelC, rowindex, celindex;
		row.cells = row.cells.map(function(cell) {
			if (cell.item && !Model.is(cell)) {
				ModelC = getmodel(cell.item);
				rowindex = row.$index;
				celindex = cell.$index;
				cell = new ModelC(cell);
				cell.$index = celindex;
				table.setcell(rowindex, celindex, cell);
			}
			return cell;
		});
		return row;
	}

	/**
	 * Get model constructor by friendly name. For more
	 * potential models, see the file {ts.ui.Collection}.
	 * TODO: All "friendly names" should be PascalCased!
	 * @param {string} item
	 * @return {Constructor}
	 */
	function getmodel(item) {
		return (
			{
				// 'select': ts.ui.SelectModel, // TODO: support
				// 'date': ts.ui.DatePickerModel, // TODO: support
				image: ts.ui.ImageModel,
				button: ts.ui.ButtonModel,
				switch: ts.ui.SwitchModel,
				userimage: ts.ui.UserImageModel,
				icon: ts.ui.IconModel,
				tag: ts.ui.TagModel
			}[item.toLowerCase()] ||
			(function nomatch() {
				console.error('"' + item + '" not matched to nothing');
				return null;
			})()
		);
	}

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
	 * Something is selected?
	 * @param {object} x
	 * @returns {boolean}
	 */
	function selected(x) {
		return !!x.selected;
	}

	/**
	 * Compute appropriate sort value for cell
	 * (the input data can be in fuzzy format).
	 * @eeturns {string|number} (or anything really!)
	 */
	function getsortvalue(row, index) {
		var cel, txt, val;
		if (Type.isArray(row)) {
			cel = row[index];
			val = Type.isObject(cel) ? cel.value : cel;
			return val;
		} else {
			cel = row.cells[index];
			txt = cel.text;
			val = cel.value;
			return val !== undefined ? val : txt;
		}
	}

	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'table',

		/**
		 * Max number of rows to show per pagination-page (zero shows all rows).
		 * TODO: Rename this!
		 * @type {number}
		 */
		maxrows: 0,

		/**
		 * Current page (mostly relevant when maxrows is set to something).
		 * Please use `this.pager.page` to change the page, this property
		 * is only public so that the EDBML renders whenever we change it.
		 * @type {number}
		 */
		page: 0,

		/**
		 * Total rows that might *not* be mounted, but may *later* be loaded from
		 * the enterprise portal server. This has to do with the pagination stuff.
		 * @type {number}
		 */
		total: 0,

		/**
		 * Rows are selectable?
		 * @type {boolean}
		 */
		selectable: false,

		/**
		 * Cols are sortable?
		 * @type {boolean}
		 */
		sortable: false,

		/**
		 * The Table should render links via Markdown?
		 * @type {boolean}
		 */
		linkable: false,

		/**
		 * @type {boolean}
		 */
		editable: false,

		/**
		 * @type {boolean}
		 */
		numbered: false,

		/**
		 * Columns.
		 * @type {ts.ui.CollCollection}
		 */
		cols: ts.ui.TableColCollection,

		/**
		 * Rows are complicated.
		 * TODO: Explain this :/
		 * @type {Array<object|Array|ts.ui.TableRowCollection<ts.ui.TableRowModel>}
		 */
		rows: ts.ui.TableRowCollection,

		/**
		 * Pager.
		 * @type {ts.ui.PagerModel}
		 */
		pager: ts.ui.PagerModel,

		/**
		 * StatusBar.
		 * TODO: Rename the property `footer` knowing that the Table will need testing!
		 * @type {ts.ui.FooterModel}
		 */
		toolbar: ts.ui.FooterBarModel,

		/**
		 * Selection menu is open?
		 * @type {boolean}
		 */
		menuopen: false,

		/**
		 * TODO: This (kind of) property should be standard in EDBML.
		 */
		tempdirtyflag: -1,

		/**
		 * Render toolbar as a statusbar (multiline in mobile view).
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.cols = this.cols || [];
			this.rows = this.rows || [];
			this.toolbar = {};
		},

		/**
		 * Compute visible columns.
		 * @returns {Array<ts.ui.ColModel}
		 */
		visibleCols: function() {
			return this.cols.filter(isvisible);
		},

		/**
		 * Compute visible rows (the ones in the current page).
		 * TODO: Cache something until new rows are added or removed
		 * @returns {Array<ts.ui.TableRowModel}
		 */
		visibleRows: function() {
			var all = this.rows;
			var vis = this._layoutrows();
			var fix = this.maxrows > 0;
			var min = this.maxrows * this.page;
			var max = min + this.maxrows;
			return vis
				.filter(function(row, i) {
					return fix ? i >= min && i < max : true;
				})
				.map(function(row) {
					return rowify(row, all.indexOf(row));
				})
				.map(function(row) {
					return modelify(this, row);
				}, this);
		},

		/**
		 * Compute visible cells for row (the column is not hidden).
		 * @returns {Array<object>}
		 */
		visibleCells: function(row) {
			var cols = this.cols;
			var cels = rowify(row).cells;
			return cels.filter(function(cell, i) {
				return cols[i].visible;
			});
		},

		/**
		 * First visible row (the one on top).
		 * @returns {ts.ui.TableRowModel}
		 */
		firstVisibleRow: function() {
			return this.visibleRows()[0] || null;
		},

		/**
		 * Something (might be) wrapping multiline?
		 * @returns {boolean}
		 */
		isWrapping: function() {
			return this.cols.some(function(col) {
				return col.wrap;
			});
		},

		/**
		 * Any visible row is selected? That is,
		 * any row on the currently shown page.
		 * @returns {boolean}
		 */
		isVisibleRowSelected: function() {
			return this.visibleRows()
				.filter(function(row) {
					return row.selectable !== false;
				})
				.some(selected);
		},

		/**
		 * Do the default search.
		 * @param {number} index
		 * @param {string} value
		 */
		search: function(index, value) {
			this._ownsearch(index, value);
		},

		/**
		 * Sort that column.
		 * @param {ts.ui.TableColModel} col
		 */
		sort: function(col) {
			if (col) {
				this._sortcol = col;
			}
		},

		/**
		 * Toggle row selection.
		 * @param {number} index
		 */
		togglerow: function(index) {
			if (this.rowselected(index)) {
				this.unselectrow(index);
			} else {
				this.selectrow(index);
			}
		},

		/**
		 * Is single row selected?
		 * @param {number} index
		 */
		rowselected: function(index) {
			var row = this.getrow(index);
			var sel = !!row.selected;
			return sel === true;
		},

		/**
		 * Select single row at index.
		 * @param {number} index
		 * @returns {boolean} True if changed
		 */
		selectrow: function(index) {
			var row = this.getrow(index);
			var sel = !!row.selected;
			if (sel === false) {
				row = this.getrow(index, true, true);
				row.selected = true;
				this.$dirty();
				return true;
			}
			return false;
		},

		/**
		 * Unselect single row at index.
		 * @param {number} index
		 * @returns {boolean} True if changed
		 */
		unselectrow: function(index) {
			var row = this.getrow(index);
			var sel = !!row.selected;
			if (sel === true) {
				row.selected = false;
				this.$dirty();
				return true;
			}
			return false;
		},

		/**
		 * Get indexes of all selected rows.
		 * @returns {Array<number>}
		 */
		selectedrows: function() {
			var indexes = [];
			this.rows.forEach(function(row, i) {
				var sel = !!row.selected;
				if (sel === true && row.selectable !== false) {
					indexes.push(i);
				}
			});
			return indexes;
		},

		/**
		 * Compute number of pages based on `maxrows` (per page).
		 * @returns {number}
		 */
		pageCount: function() {
			if (this.maxrows) {
				var show = this.rows.filter(isvisible);
				var rows = show.length;
				return Math.ceil(rows / this.maxrows);
			} else {
				return 0;
			}
		},

		/**
		 * Find the page that shows the given rowindex somewhere.
		 * @param {number} index
		 * @param {number} chuncks
		 * @returns {number}
		 */
		getPage: function(index) {
			var fit = this.maxrows;
			var row = this.rows[index];
			var all = this._layoutrows();
			var now = -1;
			return all.reduce(function(result, next, i) {
				if (result === -1) {
					now += i % fit === 0 ? 1 : 0;
					if (next === row) {
						result = now;
					}
				}
				return result;
			}, -1);
		},

		/**
		 * Get row in whatever format it was given us OR in the form of an
		 * object. Also validates that the row even exists to begin with.
		 * TODO(jmo@): The option to "persist" the reformatted row is most
		 * likely not needed anyways, because now that I think of it, you
		 * can just assign properties such as `selected` and `type` to an
		 * array without converting it into an object first. Doh! This
		 * comes with a performance overhead (and thus some workarounds)
		 * for very big tables, so let's investigate if it can be removed.
		 * @param {number} i
		 * @param @optional {boolean} asobject Convert array to object?
		 * @param @optional {boolean} persist Persist as an object?
		 * @returns {object|array}
		 */
		getrow: function(rowindex, asobject, persist) {
			var row = this.rows[rowindex];
			if (row) {
				if (asobject && Array.isArray(row)) {
					if (persist) {
						row = rowify(row, rowindex);
						this.rows.$suspend(function() {
							this.rows.splice(rowindex, 1, row);
						}, this);
					} else {
						row = rowify(row);
					}
				}
			} else {
				throw new RangeError('Row index ' + rowindex + ' is out of reach');
			}
			return row;
		},

		/**
		 * Set that row.
		 * @param {number} i
		 * @param {object|array}	row
		 */
		setrow: function(rowindex, row) {
			var oldrow = this.getrow(rowindex);
			if (oldrow) {
				this.rows.$suspend(function() {
					this.rows.splice(rowindex, 1, row);
				}, this);
				this.$dirty();
			}
		},

		/**
		 * Get that cell (always as an object) - probably not needed no more!
		 * @deprecated
		 * @param {number} rowindex
		 * @param {number} cellindex
		 * @returns {object}
		 */
		getcell: function(rowindex, cellindex) {
			var row = this.getrow(rowindex, true);
			var cell = row.cells[cellindex];
			if (cell) {
				delete cell.$index; // because this is only user-facing for now...
				return cell;
			} else {
				throw new RangeError('Cell index ' + cellindex + ' is out of reach');
			}
		},

		/**
		 * Set that cell.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 * @param {object|string|number} json
		 */
		setcell: function(rowindex, cellindex, json) {
			var row = this.getrow(rowindex, true, true);
			row.cells.splice(cellindex, 1, json);
			this.$dirty();
		},

		/**
		 * Mark cell as valid/invalid with an optional message.
		 * @param {boolean} valid
		 * @param {number} rowindex
		 * @param {number} rowindex
		 * @param @optional {string} message
		 */
		setvalidity: function(valid, rowindex, cellindex, message) {
			var row = this.getrow(rowindex, true, true);
			var cell = row.cells[cellindex];
			var now = !!cell.valid;
			if (valid !== now) {
				cell.message = valid ? null : message || null;
				cell.valid = valid;
				this.$dirty();
			}
		},

		/**
		 * Move to specific or relative position (this
		 * all relates to the keyboard focus outline).
		 * @param {gui.Position|string|null}
		 * @returns {gui.Position}
		 */
		moveposition: function(arg) {
			switch (Type.of(arg)) {
				case 'object':
					this.position = arg;
					break;
				case 'string':
					this._moverelative(arg.toLowerCase());
					break;
				case 'null':
					this.position = null;
					break;
			}
			return this.position;
		},

		// Privileged ..............................................................

		/**
		 * Compute unique ID for cell at given index.
		 * This is used both in EDBML and straight JS.
		 * @param {number} rowindex
		 * @param {number} celindex
		 * @returns {string}
		 */
		$cellid: function(rowindex, celindex) {
			return [this.$instanceid, 'cell', rowindex, celindex].join('-');
		},

		// Private .................................................................

		/**
		 * Tracking multiple search terms by column index.
		 * @type {Map<number, string>}
		 */
		_searches: null,

		/**
		 * Sort table by this column.
		 * @type {ts.ui.ColModel}
		 */
		_sortcol: null,

		/**
		 * Get (all) visible rows in correct sorted order.
		 * @returns {Array<ts.ui.TableRowModel}
		 */
		_layoutrows: function() {
			var shown = this.rows.filter(isvisible);
			var fixed = this._sort(shown, this._sortcol);
			return fixed;
		},

		/**
		 * Sort rows (if sort column exists).
		 * @param {Array<ts.ui.RowModel>} rows
		 * @param {ts.ui.TableColModel} col
		 * returns {Array<ts.ui.RowModel>}
		 */
		_sort: function(rows, col) {
			if (col) {
				var i = col.$index;
				var vals = rows.map(function columnvalue(r) {
					return getsortvalue(r, i);
				});
				if (
					vals.some(function(v) {
						return v === undefined || v === null;
					})
				) {
					throw new Error('Expected all columns cells to have a `value` or `text`');
				} else {
					var n = !vals.some(isNaN);
					rows.sort(function(r1, r2) {
						var c1 = getsortvalue(r1, i);
						var c2 = getsortvalue(r2, i);
						if (col.sort) {
							return col.sort(c1, c2, col.ascending);
						} else {
							return col.$sort(c1, c2, n);
						}
					});
				}
			}
			return rows;
		},

		/**
		 * Show only the rows whose cell at given index contains the given
		 * value using an advanced search algorithm based on `indexOf`.
		 * TODO: Make a real (public) API for hiding and showing rows
		 * TODO: Account for columns that might be hidden by config
		 * @param {number} index
		 * @param {string} value
		 */
		_ownsearch: function(index, value) {
			value = String(value).toLowerCase();
			this._searches = this._searches || {};
			if (value.length) {
				this._searches[index] = value;
			} else {
				delete this._searches[index];
			}
			var indexes = Object.keys(this._searches);
			var showall = !indexes.length;
			this.rows.forEach(function(row) {
				row.visible = showall || this._showrow(row, indexes);
			}, this);
		},

		/**
		 * Show the row, what with multiple search terms supported?
		 * @param {object|array} row
		 * @param {Array<number>} indexes
		 * @returns {boolean}
		 */
		_showrow: function(row, indexes) {
			return indexes.every(function(index) {
				var value = this._searches[index];
				return this._rowcontains(row, index, value);
			}, this);
		},

		/**
		 * Cell at given index contains given value?
		 * @param {number} index Cell index
		 * @param {string} value (lowercased already)
		 * @returns {boolean}
		 */
		_rowcontains: function(row, index, value) {
			var is = Array.isArray(row);
			var cell = is ? row[index] : row.cells[index];
			var text = String(is ? cell : cell.value).toLowerCase();
			return text.includes(value);
		}
	});
})(ts.ui.TableRowCollection, gui.Type, ts.ui.Model);
