/**
 * Table inline editing.
 * TODO: Prevent the table from changing page while invalid (or alternatively
 * cache textarea invalid values so that those can be restored on page shift).
 * @extends {ts.ui.Plugin}
 * @using {gui.CSSPluign} CSSPlugin
 * @using {gui.DOMPlugin} DOMPlugin
 * @using {gui.Position} Position
 * @using {gui.Client} Client
 * @using {gui.Key} key
 * @using {number} UNIT
 */
ts.ui.TableEditPlugin = (function(CSSPlugin, DOMPlugin, Position, Client, Key, UNIT) {
	var CLASS_CONTAINER = 'ts-table-cell';
	var CLASS_TEXTAREA = 'ts-table-input';
	var CLASS_EDITMODE = 'ts-table-editmode';
	var CLASS_NAVIMODE = 'ts-table-navimode';
	var CLASS_OUTLINER = 'ts-table-line';
	var CLASS_INVALID = 'ts-table-invalid';

	/**
	 * Query by classname.
	 * @param {Element} elm
	 * @param {string} classname
	 * @returns {Element}
	 */
	function query(elm, classname) {
		return elm.querySelector('.' + classname);
	}

	/**
	 * Element has classname?
	 * @param {Element} elm
	 * @param {string} classname
	 * @returns {boolean}
	 */
	function hasclass(elm, classname) {
		return CSSPlugin.contains(elm, classname);
	}

	return ts.ui.Plugin.extend({
		/**
		 * Prepare (and unprepare) for editing going on
		 * @param {boolean} on
		 */
		init: function(on) {
			var spirit = this.spirit,
				element = spirit.element;
			spirit.event.shift(on, 'focus blur', element, this, true);
			spirit.action.shift(on, ts.ui.ACTION_CHANGED, this);
			spirit.life.shift(on, gui.LIFE_RENDER, this);
		},

		/**
		 * Add "invalid" classname now, don't wait for model to trigger EDBML repaint.
		 * This fixes a visual glitch where a multiline textarea would collapse and
		 * then expand again non-immediately (the table layout would jump around).
		 * @param {number} rowindexe
		 * @param {number} cellindex
		 */
		failfast: function(rowindex, cellindex) {
			var td = this._getcellat(rowindex, cellindex);
			if (td) {
				CSSPlugin.add(td, CLASS_INVALID);
			}
		},

		/**
		 * Focus cell at index.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 */
		focus: function(rowindex, cellindex) {
			this._focuscell(this._getcellat(rowindex, cellindex), true);
		},

		/**
		 * Blur cell at index.
		 * @param {number} rowindex
		 * @param {number} cellindex
		 */
		blur: function(rowindex, cellindex) {
			this._focuscell(false, this._getcellat(rowindex, cellindex), true);
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			var target = e.target;
			var spirit = this.spirit;
			switch (e.type) {
				case 'focus':
				case 'blur':
					if (hasclass(target, CLASS_TEXTAREA)) {
						this._areaupdate(target, e.type === 'focus');
					} else if (this._navimode) {
						this._maybereset(spirit, target);
					}
					break;
				case 'keypress':
				case 'keydown':
					if (this._noscroll) {
						switch (e.keyCode) {
							case 38:
							case 40:
								e.preventDefault();
								e.stopPropagation();
								break;
						}
					}
					break;
			}
		},

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			if (a.type === ts.ui.ACTION_CHANGED) {
				if (ts.ui.TextAreaSpirit.is(a.target)) {
					var area = a.target.element;
					var cont = area.parentNode;
					var next = a.data.newheight;
					if (document.activeElement === area) {
						this._sync(true, area, cont, next);
					}
				}
			}
		},

		/**
		 * Handle key (cross browser fixed).
		 * TODO(jmo@): When in navimode, BACK should not trigger `history.back()``
		 * @param {gui.Key} key
		 */
		onkey: function(key) {
			var spirit = this.spirit;
			if (key.down) {
				switch (key.type) {
					case 'Enter':
						if (!Key.shiftDown) {
							if ((this._navimode = !this._navimode)) {
								this._gonavimode(spirit);
							} else {
								this._goeditmode(spirit);
							}
						}
						break;
					case 'Esc':
						if (this._editmode) {
							this._escape(this._cell);
							this._editmode = false;
							this._navimode = true;
							this._gonavimode(spirit);
						}
						break;
					default:
						this._movecell(key.type.toLowerCase());
						break;
				}
			}
		},

		/**
		 * Called when an EDBML update happened.
		 * @param {gui.Life} life
		 */
		onlife: function(life) {
			if (life.type === gui.LIFE_RENDER) {
				this._syncinvalid();
				if (this._cell) {
					// catch scenario: ENTER on edited cell
					this._resolveinvalid(this._cell);
				}
			}
		},

		// Private .................................................................

		/**
		 * While keyboard navigating (via arrow keys), this is the focused cell.
		 * TODO: Use a string ID instead (because element references not stable).
		 * @type {HTMLTableCellElement}
		 */
		_cell: null,

		/**
		 * True while editing.
		 * @type {boolean}
		 */
		_editmode: false,

		/**
		 * Is in navigation mode (arrow keys move the focus outline)?
		 * @type {boolean}
		 */
		_navimode: false,

		/**
		 * Snapshot value of an edited cell (as a string)
		 * so that later, we can figure out if it changed.
		 * @type {string}
		 */
		_snapshot: null,

		/**
		 * Marks the current position (rowindex and cellindex).
		 * @type {gui.Position}
		 */
		_position: null,

		/**
		 * Attempt to supress page scrolling on UP/DOWN keys?
		 * TODO: Move this functionality to higher order util.
		 * @type {boolean}
		 */
		_noscroll: false,

		/**
		 * Get TD element at position (in the model).
		 * @param {number} rowindex
		 * @param {number} rowindex
		 * @returns {HTMLTableCellElement}
		 */
		_getcellat: function(rowindex, cellindex) {
			var pos = new Position(cellindex, rowindex);
			var cel = this.spirit.queryplugin.getcell(pos);
			return cel;
		},

		/**
		 * Textarea focused or blurred: Start and stop edit session.
		 * @param {HTMLTextAreaElement} area
		 * @param {boolean} focused
		 */
		_areaupdate: function(area, focused) {
			var cont = area.parentNode;
			var cell = cont.parentNode;
			this._sync(focused, area, cont);
			CSSPlugin.shift(cell, focused, CLASS_EDITMODE);
			this.spirit.css.shift(focused, CLASS_EDITMODE);
			if (focused) {
				this._areafocus(this.spirit, area, cell);
			} else {
				this._areablur(area);
			}
		},

		/**
		 * Textarea focused. Start edit session.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {HTMLTextAreaElement} area
		 * @param {HTMLTableCellElement} cell
		 */
		_areafocus: function(spirit, area, cell) {
			this._resetall(spirit);
			this._editmode = true;
			this._resolveinvalid(cell);
			spirit.key.add('Enter Esc', this);
			this._snapshot = area.value.trim();
			this._cell = cell;
		},

		/**
		 * Textarea blurred. Stop edit session.
		 * @param {HTMLTextAreaElement} area
		 */
		_areablur: function(area) {
			this._editmode = false;
			this._evalchange(area, area.value.trim(), this._snapshot);
			this._snapshot = null;
			this._syncinvalid();
		},

		/**
		 * While in navimode, move the focus outline with those keys.
		 * @param {string} dir
		 * @param {boolean} skip TODO(jmo@): Hold shift to skip non-editable cells?
		 */
		_movecell: function(dir, skip) {
			var plug = this.spirit.queryplugin;
			var icel = DOMPlugin.ordinal(this._cell);
			var irow = DOMPlugin.ordinal(this._cell.parentNode);
			var rows = plug.getrows(true).dom.qall('tr');
			this._focuscell(this._nextcell(dir, rows, irow, icel));
		},

		/**
		 * @param {string} dir
		 * @param {Array<HTMLTableRowElement>} rows
		 * @param {number} irow
		 * @param {number} icel
		 */
		_nextcell: function(dir, rows, irow, icel) {
			var row = rows[irow];
			var cels = row.cells;
			var cell = cels[icel];
			var selects = this.spirit._model.selectable;
			var initrow = rows[0];
			var lastrow = rows[rows.length - 1];
			var initcel = cels[selects ? 1 : 0];
			var lastcel = cels[cels.length - 1];
			switch (dir) {
				case 'up':
					return (row === initrow ? lastrow : rows[--irow]).cells[icel];
				case 'down':
					return (row === lastrow ? initrow : rows[++irow]).cells[icel];
				case 'left':
					return cell === initcel ? lastcel : cels[--icel];
				case 'right':
					return cell === lastcel ? initcel : cels[++icel];
			}
		},

		/**
		 * Focus cell outline or texarea (or blur the current cell).
		 * @param {HTMLTableCellElement|null} cell
		 * @param @optional {boolean} edit Focus the textarea?
		 */
		_focuscell: function(cell, edit) {
			var current = this._cell;
			var target = edit ? CLASS_TEXTAREA : CLASS_OUTLINER;
			if ((this._cell = cell)) {
				this._resolveinvalid(cell);
				gui.Tick.time(function() {
					query(cell, target).focus();
				});
			} else if (current) {
				query(current, target).blur();
			}
		},

		/**
		 * Enter navigation mode: Arrow keys move the focus.
		 * @param {ts.ui.TableSpirit} spirit
		 */
		_gonavimode: function(spirit) {
			spirit.css.add(CLASS_NAVIMODE);
			spirit.key.add('Up Down Left Right', this);
			this._scrollsuppress(true);
			this._focuscell(this._cell);
		},

		/**
		 * Enter edit mode coming from navigation mode.
		 * @param {ts.ui.TableSpirit} spirit
		 */
		_goeditmode: function(spirit) {
			var cell = this._cell;
			var area = query(cell, CLASS_TEXTAREA);
			if (area) {
				// otherwise not editable
				this._resetall(spirit);
				area.focus();
			}
		},

		/**
		 * If something changed, perhaps it's time to invoke the callback.
		 * TODO: Perhaps just set this up with an `onchange` listener :/
		 * @param {HTMLTextAreaElement} area
		 * @param {string} newval
		 * @param {string} oldval
		 */
		_evalchange: function(area, newval, oldval) {
			var spirit = this.spirit;
			var onedit = spirit.onedit;
			if (onedit && newval !== oldval) {
				var pos = spirit.queryplugin.getpos(area);
				onedit.call(spirit, pos.y, pos.x, newval, oldval);
			}
		},

		/**
		 * When enabled (so in keyboard navigation mode),
		 * arrow UP/DOWN will not scroll the whole page.
		 * TODO(jmo@): Perhaps move this to general util?
		 * @param {boolean} enabled
		 */
		_scrollsuppress: function(enabled) {
			var events = 'keypress keydown'; // browser specific :/
			this.spirit.event.shift((this._noscroll = enabled), events, document, this);
		},

		/**
		 * Synchronize (and reset) the size of textarea and container.
		 * TODO: The `clip` update should probably be fixed differently
		 * TODO: Move this stuff to the {ts.ui.TableLayoutPlugin}
		 * TODO: If no cols in Table, don't substract the `-1` value :/
		 * @param {boolean} sync (reset when false)
		 * @param {HTMLTextAreaElement} area
		 * @param {HTMLDivElement} cont
		 * @param @optional {number} height
		 */
		_sync: function(sync, area, cont, height) {
			height = (height || area.offsetHeight) - 1;
			height = Math.round(height / UNIT) * UNIT - 1;
			if (sync) {
				cont.style.minHeight = height + 'px';
				this._shrink(area, height);
			} else {
				cont.style.minHeight = '';
				this._shrink(area, 0);
			}
		},

		/**
		 * Make the textarea appear smaller than it really is so that it doesn't
		 * appear to overlap the bottom cell border. Unfortunately, IE11 and up
		 * has a bug where this affects the *actual* height of the textarea :/
		 * TODO(jmo@): We still need to perform this cosmetic tweak for newer IE!
		 * @param {HTMLTextAreaElement} area
		 * @param {number|boolean} height
		 */
		_shrink: function(area, height) {
			if (!Client.isExplorer11 && !Client.isEdge) {
				if (height) {
					area.style.clip = 'rect(auto,auto,' + height + 'px,auto)';
				} else {
					area.style.clip = '';
				}
			}
		},

		/**
		 * Sync all invalid cells to the height of the textarea.
		 * TODO(jmo@): To look right in navimode, all cells in
		 * to row should be synced (and unsynced when validated).
		 * This might involve {ts.ui.TableLayoutPlugin#_hflex}.
		 */
		_syncinvalid: function() {
			this.spirit.dom.qall('.' + CLASS_INVALID).forEach(function(td) {
				var cont = query(td, CLASS_CONTAINER);
				var area = query(td, CLASS_TEXTAREA);
				this._sync(true, area, cont);
			}, this);
		},

		/**
		 * While keyboard navigating, reset all if
		 * something outside the Table is clicked.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {HTMLElement} elm
		 */
		_maybereset: function(spirit, elm) {
			if (hasclass(elm, CLASS_OUTLINER)) {
				gui.Tick.next(function allow_new_focus() {
					var rows = spirit.queryplugin.getrows();
					var curr = document.activeElement;
					if (!DOMPlugin.contains(rows, curr) || !curr) {
						this._resetall(spirit);
					}
				}, this);
			}
		},

		/**
		 * Remove traces of editmode and navimode.
		 * @param {ts.ui.TableSpirit} spirit
		 */
		_resetall: function(spirit) {
			spirit.key.remove('Up Down Left Right Enter Esc', this);
			spirit.css.remove([CLASS_NAVIMODE, CLASS_EDITMODE]);
			this._scrollsuppress(false);
			this._navimode = false;
			this._editmode = false;
		},

		/**
		 * Update Table statusbar to show potential error message.
		 * @param {HTMLTableCellElement} cell
		 * @retrurns {boolean} True when invalid
		 */
		_resolveinvalid: function(cell) {
			var spirit = this.spirit;
			var model = spirit._model;
			// The cell is invalid when the row is empty
			if (!model.rows.length) {
				return false;
			}
			if ((cell = this._getcellmodel(spirit, model, cell))) {
				if (!cell.valid && cell.message) {
					spirit.$errormessage(cell.message);
					return true;
				} else {
					spirit.$errormessage(null);
				}
			}
			return false;
		},

		/**
		 * Lookup (readonly) cell model for cell element.
		 * @param {ts.ui.TableSpirit} spirit
		 * @param {ts.ui.TableModel} model
		 * @param {HTMLTableCellElement} cell
		 * @returns {object}
		 */
		_getcellmodel: function(spirit, model, cell) {
			var pos = spirit.queryplugin.getpos(cell);
			var cel = model.getcell(pos.y, pos.x);
			return cel;
		},

		/**
		 * ESCAPE key was pressed. Restore original value.
		 * TODO: This should require less hacks :/
		 * @param {HTMLTableCellElement} cell
		 */
		_escape: function(cell) {
			var area = query(cell, CLASS_TEXTAREA);
			if (this._snapshot !== null) {
				area.value = this._snapshot;
			} else {
				console.error('Out of synch');
			}
		}
	});
})(gui.CSSPlugin, gui.DOMPlugin, gui.Position, gui.Client, gui.Key, ts.ui.UNIT);
