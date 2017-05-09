/**
 * DOM query studio. Lookup elements and spirits inside the Table. Also
 * parse element attributes and pinpoint elements position in the model.
 * @extends {ts.ui.Plugin}
 * @using {gui.Type} Type
 */
ts.ui.TableQueryPlugin = (function(Type) {
	return ts.ui.Plugin.extend({
		/**
		 * Get the rows element or spirit.
		 * @param {boolean} getspirit
		 * @returns {Element|ts.ui.Spirit}
		 */
		getrows: function(getspirit) {
			return this._get('.ts-table-rows', getspirit);
		},

		/**
		 * Get the cols element or spirit.
		 * @param {boolean} getspirit
		 * @returns {Element|ts.ui.Spirit}
		 */
		getcols: function(getspirit) {
			return this._get('.ts-table-cols', getspirit);
		},

		/**
		 * Get the gutter element (that's the checkboxes).
		 * @param {boolean} getspirit
		 * @returns {Element|ts.ui.Spirit}
		 */
		getguts: function(getspirit) {
			return this._get('.ts-table-gutter', getspirit);
		},

		/**
		 * Get the global selecbutton/selectmenu element.
		 * @param {boolean} getspirit
		 * @returns {Element|ts.ui.Spirit}
		 */
		getmenu: function(getspirit) {
			return this._get('.ts-table-menu', getspirit);
		},

		/**
		 * Get the `DIV` called body.
		 * @returns {HTMLDivElement}
		 */
		getbody: function() {
			return this._get('.ts-table-body');
		},

		/**
		 * Get table cell (element) at position (cellindex and rowindex).
		 * @returns {HTMLTableCellElement}
		 */
		getcell: function(pos) {
			var rowindex = pos.y;
			var celindex = pos.x;
			var model = this.spirit._model;
			var id = model.$cellid(rowindex, celindex);
			return this.spirit.dom.q('#' + id);
		},

		/**
		 * Figure out what rowindex and cellindex (in the model) a given
		 * DOM element relates to (this can be any element in the rows).
		 * TODO: This information can now be extracted from the cell ID!!!
		 * @param {DOMElement} elm
		 * @returns {gui.Position} Where `y` is the rowindex and `x` is the cell.
		 *					or `null` if element is not associated to position in the model
		 */
		getpos: function(elm) {
			var pos = new gui.Position();
			var rows = this.getrows();
			while (elm && elm !== rows) {
				switch (elm.localName) {
					case 'tr':
						pos.y = this.getindex(elm);
						break;
					case 'td':
						pos.x = this.getindex(elm);
						break;
				}
				elm = elm.parentNode;
			}
			if (pos.y !== null && pos.x !== null) {
				return pos;
			} else {
				return null;
			}
		},

		/**
		 * Get `data-index` value from element (as a number).
		 * @param {Element} elm
		 * @returns {number}
		 */
		getindex: function(elm) {
			var i = elm.getAttribute('data-index');
			return i !== null ? Type.cast(i) : i;
		},

		/**
		 * Get `data-action` value from element (as a string).
		 * @param {Element} elm
		 * @returns {string}
		 */
		getaction: function(elm) {
			return elm.getAttribute('data-action');
		},

		// Private .................................................................

		/**
		 * Get element or spirit.
		 * @param {boolean} getspirit
		 * @returns {Element|ts.ui.Spirit}
		 */
		_get: function(selector, getspirit) {
			var elem = this.spirit.dom.q(selector);
			return getspirit ? (elem ? ts.ui.get(elem) : null) : elem;
		}
	});
})(gui.Type);
