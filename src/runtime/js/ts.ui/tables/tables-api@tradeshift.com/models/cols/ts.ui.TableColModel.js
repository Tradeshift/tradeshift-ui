/**
 * Advanced table column model.
 * @extends {ts.ui.Model}
 * @using {gui.Combo.chained} chained
 */
ts.ui.TableColModel = (function using(chained) {
	// remove special characters from
	// alphabetic sorting sequence and also
	// check if the string contains
	// asian characters: https://stackoverflow.com/a/43419070
	var SPECIAL = /[^A-z\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\d ]/gi;

	/**
	 * Sort numerically.
	 * @param {number} n1
	 * @param {number} n1
	 * @param {boolean} ascending
	 */
	function sortnum(n1, n2, ascending) {
		if (n1 < n2) {
			return ascending ? -1 : 1;
		}
		if (n1 > n2) {
			return ascending ? 1 : -1;
		}
		return 0;
	}

	/**
	 * Sort alphabetically in a non-sophisticated way.
	 * @param {string} s1
	 * @param {string} s2
	 * @param {boolean} ascending
	 */
	function sortalpha(a, b, ascending) {
		var com = compare(normalize(a), normalize(b));
		if (com < 0) {
			return ascending ? -1 : 1;
		}
		if (com > 0) {
			return ascending ? 1 : -1;
		}
		return 0;
	}

	/**
	 * This seems to tweak the alphabetical sorting favourably.
	 * @param {string} string
	 * @returns {string}
	 */
	function normalize(string) {
		return string.toLowerCase().replace(SPECIAL, '');
	}

	/**
	 * You can apparently `localeCompare` strings for
	 * better resolution of strange regional characters.
	 * @see http://mdn.io/localeCompare
	 * TODO(jmo@): Support futher locale options
	 */
	function compare(string1, string2) {
		if (string1.localeCompare) {
			return string1.localeCompare(string2);
		} else {
			return string1 > string2;
		}
	}

	return ts.ui.Model.extend({
		/**
		 * Friendly name
		 * @type {string}
		 */
		item: 'tablecol',

		/**
		 * Column (cell) content type. Matches `ts-text` or `ts-number`.
		 * @type {string}
		 */
		type: 'ts-text',

		/**
		 * Col is hidden for some reason?
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * Col is selected (when sorting)?
		 * @type {boolean}
		 */
		selected: false,

		/**
		 * Sorting ascending?
		 * @type {boolean}
		 */
		ascending: true,

		/**
		 * Cells in this column are editable? Please note that
		 * this is assumed `true` unless explicitly denied!
		 * @type {boolean}
		 */
		editable: true,

		/**
		 * Column flex.
		 * @type {number}
		 */
		flex: 1,

		/**
		 * Wrap text (in the cells)?
		 * @type {boolean}
		 */
		wrap: false,

		/**
		 * Minimum width in pixels (zero means no such).
		 * @type {number}
		 */
		minwidth: 0,

		/**
		 * Fixed width in pixels (zero means no such).
		 * @type {number}
		 */
		width: 0,

		/**
		 * Search config.
		 * @type {ts.ui.SearchModel}
		 */
		search: ts.ui.SearchModel,

		/**
		 * Button config.
		 * @type {ts.ui.ButtonModel}
		 */
		button: ts.ui.ButtonModel,

		/**
		 * Hide the column.
		 * @returns {ts.ui.TableColModel}
		 */
		hide: chained(function() {
			this.visible = false;
		}),

		/**
		 * Cells in this column are sortable? Please note that
		 * This works only on the sortable tables!
		 * @type {boolean}
		 */
		sortable: true,

		/**
		 * Show the column.
		 * @returns {ts.ui.TableColModel}
		 */
		show: chained(function() {
			this.visible = true;
		}),

		/**
		 * Open for implementation: Function used to sort the column cells by `value`.
		 * This should work much like an array sort that returns `1` or `-1` or `0`.
		 * If this is not specified, we sort via the fallback `$sort` method below.
		 * @type {function}
		 */
		sort: null,

		/**
		 * Is (cell content) of type number?
		 * @returns {boolean}
		 */
		isNumber: function() {
			return this.type.split(' ').indexOf('ts-number') > -1;
		},

		/**
		 * Temp API updated warning.
		 * Can be removed later on...
		 */
		onconstruct: function() {
			this.super.onconstruct();
			var type = this.type;
			if (type === 'text' || type === 'number') {
				this.type = 'ts-' + type;
				console.warn(
					'The column `type` property must be changed ' + 'from "' + type + '" to "ts-' + type + '"'
				);
			}
		},

		// Privileged ..............................................................

		/**
		 * Fallback sort mechanism (if method `sort` is not implemented).
		 * @param {string|number} val1
		 * @param {string|number} val2
		 * @param {boolean} numberically
		 * @returns {number}
		 */
		$sort: function(val1, val2, numerically) {
			var ascending = this.ascending;
			if (numerically) {
				return sortnum(val1, val2, ascending);
			} else {
				return sortalpha(val1, val2, ascending);
			}
		}
	});
})(gui.Combo.chained);
