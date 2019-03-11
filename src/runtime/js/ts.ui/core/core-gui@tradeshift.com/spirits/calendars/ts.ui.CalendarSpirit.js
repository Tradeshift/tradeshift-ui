/**
 * Spirit of the calendar.
 * @see	https://github.com/Tradeshift/Apps/pull/707
 * @extends {ts.ui.Spirit}
 * @using {Object} locale (ad-hoc localization config)
 */
ts.ui.CalendarSpirit = (function() {
	/**
	 *
	 */
	function getRelativeYear(year, diff) {
		return parseInt(year, 10) + diff;
	}

	function getLocale() {
		return ts.ui.DatePicker.localize();
	}

	/**
	 *
	 */
	function getRelativeMonth(year, month, diff) {
		month = parseInt(month, 10) + diff;
		year = parseInt(year, 10);
		if (month < 0) {
			year = getRelativeYear(year, -1);
			month = 11;
		} else if (month > 11) {
			year = getRelativeYear(year, 1);
			month = 0;
		}
		return {
			year: year,
			month: month
		};
	}

	/**
	 * Exposed for easier unit testing.
	 */
	ts.ui.__generateDays = function(
		year,
		month,
		currentYear,
		currentMonth,
		currentDay,
		startingValue
	) {
		year = parseInt(year, 10);
		month = parseInt(month, 10);
		currentDay = parseInt(currentDay, 10);
		currentYear = parseInt(currentYear, 10);
		currentMonth = parseInt(currentMonth, 10);

		var numDays = ts.lib.Date.getDaysInMonth(year, month);
		var startDay = (ts.lib.Date.getFirstDayInMonth(year, month) - getLocale().firstDay + 7) % 7;

		return actuallyGenerateDays(
			year,
			month,
			currentDay,
			numDays,
			ts.lib.Date.getDaysInMonth(year, month - 1),
			startDay,
			Math.ceil((numDays + startDay) / 7),
			year === currentYear && month === currentMonth && startingValue,
			year === ts.lib.Date.getCurrentFullYear() && month === ts.lib.Date.getCurrentMonth()
		);
	};

	/**
	 *
	 */
	function actuallyGenerateDays(
		year,
		month,
		currentDay,
		numDays,
		numDaysInPrevMonth,
		startDay,
		numRows,
		selectedIsVisible,
		todayIsVisible
	) {
		var row,
			col,
			cells = [];
		for (row = 0; row < numRows; ++row) {
			for (col = 0; col < 7; ++col) {
				var i = row * 7 + col,
					day = i - startDay + 1,
					tempRow = null,
					newDate;
				if (col === 0) {
					cells[row] = [];
				}
				if (day > 0 && day <= numDays) {
					tempRow = cells[row];
					tempRow[col] = new Cell({
						today: todayIsVisible && day === ts.lib.Date.getCurrentDay(),
						selected: selectedIsVisible && day === currentDay,
						year: year,
						month: month,
						day: day
					});
				} else if (day <= 0) {
					// cells from the previous month
					newDate = getRelativeMonth(year, month, -1);
					tempRow = cells[row];
					tempRow[col] = new Cell({
						year: newDate.year,
						month: newDate.month,
						day: numDaysInPrevMonth + day,
						prev: true
					});
				} else if (day > numDays) {
					// cells from the next month
					newDate = getRelativeMonth(year, month, 1);
					tempRow = cells[row];
					tempRow[col] = new Cell({
						year: newDate.year,
						month: newDate.month,
						day: day - numDays,
						next: true
					});
				}
			}
		}
		return cells;
	}

	/**
	 * TODO (jmo@): This is a temporary hack to emulate translation.
	 * @param {string} term
	 * @return {string}
	 */
	// eslint-disable-next-line no-unused-vars
	function t(term) {
		return term;
	}

	/**
	 * One of these things for each day in the calendars "view".
	 * The view may contain cells for previous and next month.
	 * @param {Map} data
	 */
	function Cell(data) {
		gui.Object.extend(this, data);
	}
	Cell.prototype = {
		year: -1,
		month: -1,
		day: -1,
		today: false,
		selected: false,
		next: false,
		prev: false,
		stringify: function() {
			return JSON.stringify(this);
		}
	};
	Cell.parse = function(string) {
		return new Cell(JSON.parse(string));
	};

	return ts.ui.Spirit.extend(
		{
			/**
			 * Selected date in the form of YYYY-MM-DD (as defined in RFC3339.)
			 * @type {string}
			 */
			value: null,

			/**
			 * Min date in YYYY-MM-DD.
			 * @type {string}
			 */
			min: null,

			/**
			 * Max date in YYYY-MM-DD.
			 * @type {string}
			 */
			max: null,

			/**
			 * @type {function}
			 */
			onselect: null,

			/**
			 * Customized function used for adding additional restrictions on what days can be selected
			 * from the calendar/datePicker.
			 * @type {function}
			 */
			onrendercell: null,

			/**
			 * Load default template and
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.event.add('click');

				// if supplied, import settings from the {ts.ui.DatePickerModel}
				if (this._ismodelled()) {
					['min', 'max', 'value', 'onrendercell'].forEach(function(key) {
						this[key] = this._model[key];
					}, this);
				}

				// compute the setup
				if (ts.lib.Date) {
					this._labels = this._generateLabels();
					this._today = ts.lib.Date.getCurrentDay();
					this._current = this._getCurrentDate();
					this._year = this._current.year;
					this._month = this._current.month;
					if (this.min) {
						this._min = ts.lib.Date.dateStringToObject(this.min);
					}
					if (this.max) {
						this._max = ts.lib.Date.dateStringToObject(this.max);
					}
				} else {
					throw new Error('Dysfunction');
				}

				// load EDBML and render
				if (!this.script.loaded) {
					this.script.load(ts.ui.CalendarSpirit.edbml);
					this._render();
				}
			},

			_getCurrentDate: function() {
				var currentDate = 'today';

				if (this.value) {
					currentDate = this.value;
				} else {
					this._startingValue = false;

					if (this.min) {
						currentDate = this.min;
					} else if (this.max) {
						currentDate = this.max;
					}
				}

				return ts.lib.Date.dateStringToObject(currentDate);
			},

			/**
			 * Handle event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				var node = e.target;
				if (e.type === 'click') {
					if (this._doaction(node.parentNode, node)) {
						e.stopPropagation();
						e.preventDefault();
					}
				}
			},

			// Private .................................................................

			/**
			 * Optional model.
			 * @type {ts.ui.DatePickerModel}
			 */
			_model: null,

			/**
			 * Tracking the zero-based month.
			 * @type {number}
			 */
			_month: -1,

			/**
			 * Tracking the year.
			 * @type {number}
			 */
			_year: -1,

			/**
			 * Short weekday names.
			 * @type {Array<string>}
			 */
			_labels: null,

			/**
			 * Today is the day (as an object).
			 * @type {Map}
			 */
			_today: null,

			/**
			 * @type {Map}
			 */
			_current: null,

			/**
			 * Internal flag to determine if the datePicker component should have a starting value. Used to determine
			 * if a date should be pre-selected and omitted from being clickable.
			 * @type {Boolean}
			 */
			_startingValue: true,

			/**
			 * @type {Map}
			 */
			_min: null,

			/**
			 * @type {Map}
			 */
			_max: null,

			/**
			 * Perhaps execute action for something that was clickped upon.
			 * @param {Element} parent
			 * @param {Element} child
			 */
			_doaction: function(parent, child) {
				var testnode = parent.localName === 'button' ? parent : child;
				switch (testnode.name) {
					case 'accept':
						this._select(Cell.parse(testnode.value));
						break;
					case 'nextMonth':
						this._nextMonth();
						break;
					case 'prevMonth':
						this._prevMonth();
						break;
					case 'prevYear':
						this._prevYear();
						break;
					case 'nextYear':
						this._nextYear();
						break;
					default:
						return false;
				}
				return true;
			},

			/**
			 * Select cell. Called fromt the EDBML template.
			 * @param {Cell} cell
			 */
			_select: function(cell) {
				var month = cell.month + 1;
				var day = cell.day;
				if (month < 10) {
					month = '0' + month;
				}
				if (day < 10) {
					day = '0' + day;
				}
				// TODO (jmo@): support preventDefault and return false for this callback
				this.value = cell.year + '-' + month + '-' + day;
				this._current = ts.lib.Date.dateStringToObject(this.value);
				if (cell.prev) {
					this._prevMonth();
				} else if (cell.next) {
					this._nextMonth();
				} else {
					this._render();
				}
				if (this.onselect) {
					new Function(['value'], this.onselect).call(this, this.value);
				}
				if (this._ismodelled()) {
					this._model.value = this.value;
				}
			},

			/**
			 * View previous month.
			 */
			_prevMonth: function() {
				var newDate = getRelativeMonth(this._year, this._month, -1);
				this._month = newDate.month;
				this._year = newDate.year;
				this._render();
			},

			/**
			 * View next month.
			 */
			_nextMonth: function() {
				var newDate = getRelativeMonth(this._year, this._month, 1);
				this._month = newDate.month;
				this._year = newDate.year;
				this._render();
			},

			/**
			 * View previous year.
			 */
			_prevYear: function() {
				this._year = getRelativeYear(this._year, -1);
				this._render();
			},

			/**
			 * View next year.
			 */
			_nextYear: function() {
				this._year = getRelativeYear(this._year, 1);
				this._render();
			},

			/**
			 * Generate short weekday names starting from locale first.
			 * TODO (jmo@): Move to static variable since it's always the same.
			 * @return {Array<string>}
			 */
			_generateLabels: function() {
				var labels = [],
					i;
				for (i = 0; i < 7; ++i) {
					labels.push(getLocale().dayNamesMin[(i + getLocale().firstDay) % 7]);
				}
				return labels;
			},

			/**
			 * @return {Array<Cell>}
			 */
			_generateDays: function(year, month) {
				return ts.ui.__generateDays(
					year,
					month,
					this._current.year,
					this._current.month,
					this._current.day,
					this._startingValue
				);
			},

			/**
			 * Compute minimum day.
			 * @param {object} min
			 * @param {number} year
			 * @param {number} month
			 */
			_minDay: function(min, year, month) {
				var day = 0;
				if (min && year === min.year) {
					if (month === min.month) {
						day = min.day;
					} else {
						if (month < min.month) {
							day = Number.MAX_VALUE;
						}
					}
				}
				return day;
			},

			/**
			 * Compute maximum day.
			 * @param {object} max
			 * @param {number} year
			 * @param {number} month
			 */
			_maxDay: function(max, year, month) {
				var day = 0;
				if (max && year === max.year) {
					if (month === max.month) {
						day = max.day;
					} else {
						if (month > max.month) {
							day = 1 - Number.MAX_VALUE;
						}
					}
				}
				return day;
			},

			/**
			 * Run EDBML with computed arguments.
			 */
			_render: function() {
				var names = getLocale().monthNamesShort,
					year = this._year,
					month = this._month,
					mname = names[month],
					labels = this._labels,
					min = this._min,
					max = this._max,
					view = this._generateDays(year, month);

				var prevYear = !min || year > min.year ? 'prevYear' : '';
				var nextYear = !max || year < max.year ? 'nextYear' : '';
				var prevMonth = min && year === min.year && month <= min.month ? '' : 'prevMonth';
				var nextMonth = max && year === max.year && month >= max.month ? '' : 'nextMonth';
				var minDay = this._minDay(min, year, month);
				var maxDay = this._maxDay(max, year, month);

				// If no day limiter is passed, then we will create a new function for the day limiter which passes in all days
				// as selectable dates
				var onrendercell = this.onrendercell || function() {};

				this.script.run(
					labels,
					mname,
					year,
					view,
					prevYear,
					nextYear,
					prevMonth,
					nextMonth,
					minDay,
					maxDay,
					onrendercell
				);
			}
		},
		{
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @param {ts.ui.DatePickerModel} opt_model
			 */
			summon: function(opt_model) {
				var html = ts.ui.datepicker.edbml(opt_model);
				var elem = gui.HTMLParser.parse(html);
				return this.possess(elem);
			}
		}
	);
})();
