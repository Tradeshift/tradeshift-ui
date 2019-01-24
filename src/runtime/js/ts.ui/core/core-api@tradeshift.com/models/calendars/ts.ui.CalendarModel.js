/**
 * Advanced calendar model.
 * @extends {ts.ui.Model}
 */
ts.ui.CalendarModel = (function() {
	/**
	 * TEMPORARY HACK FOR LOCALIZATION.
	 * @param {string} translatable
	 * @return {string}
	 */
	function t(translatable) {
		return translatable;
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
		prev: false
	};

	return ts.ui.Model.extend(
		{
			/**
			 * Friendly name.
			 * @type {string}
			 */
			item: 'calendar',

			/**
			 * [now description]
			 * @type {String}
			 */
			now: null,

			/**
			 * TODO (jmo@):
			 * @type {string}
			 */
			min: null,

			/**
			 * TODO (jmo@):
			 * @type {string}
			 */
			max: null,

			/**
			 * @type {number}
			 */
			year: 0,

			/**
			 * @type {string}
			 */
			month: null,

			/**
			 * @type {Array<object>}
			 */
			view: null,

			/**
			 * All arguments take the form YYYY-MM-DD as defined in RFC3339.
			 * @param {string=} opt_now
			 * @param {string=} opt_min
			 * @param {string=} opt_max
			 */
			onconstruct: function() {
				this.super.onconstruct();
				if (ts.lib.Date) {
					this._currentDay = ts.lib.Date.getCurrentDay();
					this._selectedDate = ts.lib.Date.dateStringToObject(this.now || 'today');
					this.year = this._selectedDate.year;
					this._month = this._selectedDate.month;
					this.day = this._selectedDate.day;
					this.dayLabels = this._generateLabels(this.year, this._month);
					this.regenerate();
				} else {
					throw new Error('Dysfunction');
				}
			},

			/**
			 *
			 */
			prevMonth: function() {
				var newDate = this._getRelativeMonth(this.year, this._month, -1);
				this._month = newDate.month;
				this.year = newDate.year;
				this.regenerate();
			},

			/*
			 *
			 */
			nextMonth: function() {
				var newDate = this._getRelativeMonth(this.year, this._month, 1);
				this._month = newDate.month;
				this.year = newDate.year;
				this.regenerate();
			},

			/**
			 *
			 */
			prevYear: function() {
				this.year = this._getRelativeYear(this.year, -1);
				this.regenerate();
			},

			/**
			 *
			 */
			nextYear: function() {
				this.year = this._getRelativeYear(this.year, 1);
				this.regenerate();
			},

			/**
			 * Select cell.
			 * @param {Cell} cell
			 */
			select: function(cell) {
				var month = cell.month + 1,
					day = cell.day;
				if (month < 10) {
					month = '0' + month;
				}
				if (day < 10) {
					day = '0' + day;
				}
				this.now = cell.year + '-' + month + '-' + day;
				this._selectedDate = ts.lib.Date.dateStringToObject(this.now);
				if (cell.prev) {
					this.prevMonth();
				} else if (cell.next) {
					this.nextMonth();
				} else {
					this.regenerate();
				}
			},

			// Private ....................................................

			/**
			 * Tracking month.
			 * @type {number}
			 */
			_month: -1,

			/**
			 *
			 */
			_getRelativeYear: function(year, diff) {
				return parseInt(year, 10) + diff;
			},

			/**
			 *
			 */
			_getRelativeMonth: function(year, month, diff) {
				month = parseInt(month, 10) + diff;
				year = parseInt(year, 10);
				if (month < 0) {
					// 0 is january
					year = this._getRelativeYear(year, -1);
					month = 11; // 11 is december
				} else if (month > 11) {
					year = this._getRelativeYear(year, 1);
					month = 0;
				}
				return {
					year: year,
					month: month
				};
			},

			/**
			 *
			 */
			_generateLabels: function(year, month) {
				var dayLabels = [],
					i;
				for (i = 0; i < 7; ++i) {
					dayLabels.push(ts.ui.CalendarModel.DAY_NAMES_MIN[(i + ts.ui.CalendarModel.firstDay) % 7]);
				}
				return dayLabels;
			},

			/**
			 *
			 */
			_generateDays: function(year, month) {
				year = parseInt(year, 10);
				month = parseInt(month, 10);
				var days = [],
					numDays = ts.lib.Date.getDaysInMonth(year, month),
					numDaysInPrevMonth = ts.lib.Date.getDaysInMonth(year, month - 1),
					startDay = ts.lib.Date.getFirstDayInMonth(year, month) - ts.ui.CalendarModel.firstDay,
					// TODO (jmo@): some kind of hack for february???
					numRows = Math.ceil(numDays / 7),
					selectedIsVisible =
						year === parseInt(this._selectedDate.year, 10) &&
						month === parseInt(this._selectedDate.month, 10),
					todayIsVisible =
						year === ts.lib.Date.getCurrentFullYear() && month === ts.lib.Date.getCurrentMonth(),
					row,
					col;
				// days[row][col] = {...}
				for (row = 0; row < numRows; ++row) {
					for (col = 0; col < 7; ++col) {
						var i = row * 7 + col,
							day = i - startDay + 1,
							tempRow = null,
							newDate;
						if (col === 0) {
							days[row] = [];
						}
						if (day > 0 && day <= numDays) {
							tempRow = days[row];
							tempRow[col] = new Cell({
								today: todayIsVisible && day === this._currentDay,
								selected: selectedIsVisible && day === parseInt(this._selectedDate.day, 10),
								year: year,
								month: month,
								day: day
							});
						} else if (day <= 0) {
							// days from the previous month
							newDate = this._getRelativeMonth(year, month, -1);
							tempRow = days[row];
							tempRow[col] = new Cell({
								year: newDate.year,
								month: newDate.month,
								day: numDaysInPrevMonth + day,
								prev: true
							});
						} else if (day > numDays) {
							// days from the next month
							newDate = this._getRelativeMonth(year, month, 1);
							tempRow = days[row];
							tempRow[col] = new Cell({
								year: newDate.year,
								month: newDate.month,
								day: day - numDays,
								next: true
							});
						}
					}
				}
				return days;
			},

			/**
			 *
			 */
			regenerate: function() {
				this.month = ts.ui.CalendarModel.MONTH_NAMES_SHORT[this._month];
				this.view = this._generateDays(this.year, this._month);
			}
		},
		{
			// Static .........................................

			/**
			 * IMPORTANT! This must be localized!
			 * @type {number}
			 */
			firstDay: 1,

			/**
			 * Months of the year. How many do you know?
			 * @type {Array<string>}
			 */
			MONTH_NAMES: [
				t('January'),
				t('February'),
				t('March'),
				t('April'),
				t('May'),
				t('June'),
				t('July'),
				t('August'),
				t('September'),
				t('October'),
				t('November'),
				t('December')
			],

			/**
			 * Shorter months for more deadlines.
			 * @type {Array<string>}
			 */
			MONTH_NAMES_SHORT: [
				t('Jan'),
				t('Feb'),
				t('Mar'),
				t('Apr'),
				t('May'),
				t('Jun'),
				t('Jul'),
				t('Aug'),
				t('Sep'),
				t('Oct'),
				t('Nov'),
				t('Dec')
			],

			/**
			 * Day names.
			 * @type {Array<string>}
			 */
			DAY_NAMES: [
				t('Sunday'),
				t('Monday'),
				t('Tuesday'),
				t('Wednesday'),
				t('Thursday'),
				t('Friday'),
				t('Saturday')
			],

			/**
			 * Short day names.
			 * @type {Array<string>}
			 */
			DAY_NAMES_SHORT: [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')],

			/**
			 * Compact day names.
			 * @type {Array<string>}
			 */
			DAY_NAMES_MIN: [t('Su'), t('Mo'), t('Tu'), t('We'), t('Th'), t('Fr'), t('Sa')]
		}
	);
})();

/*
function Controller ( lib) {
	function getRelativeYear(year, diff) {
		return parseInt(year,10) + diff;
	}

	function getRelativeMonth(year, month, diff) {
		month = parseInt(month,10) + diff;
		year = parseInt(year,10);
		if ( month < 0) { //0 is january
			month = 11; //11 is december
			year = getRelativeYear(year, -1);
		} else if ( month > 11) {
			month = 0;
			year = getRelativeYear(year, 1);
		}
		return {
			year: year,
			month: month
		};
	}
	var regional = {
			monthNames: [t('January'),t('February'),t('March'),t('April'),t('May'),
			t('June'), t('July'),t('August'),t('September'),t('October'),
			t('November'),t('December')],
			monthNamesShort: [t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'),
			t('Jun'), t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec')],
			dayNames: [t('Sunday'), t('Monday'), t('Tuesday'), t('Wednesday'),
			t('Thursday'), t('Friday'), t('Saturday')],
			dayNamesShort: [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'),
			t('Fri'), t('Sat')],
			dayNamesMin: [t('Su'),t('Mo'),t('Tu'),t('We'),t('Th'),t('Fr'),t('Sa')],
			firstDay: 1
		},
		_currentDay = lib.date.getCurrentDay();

	return {
		onscope: function ( scope) {

			function generateLabels(year, month) {
				var dayLabels = [],
					i;
				for ( i = 0; i < 7; ++i) {
					lib.adsafe.set(dayLabels, i, lib.adsafe.get(regional.dayNamesMin,
					(i+regional.firstDay)%7));
				}
				return dayLabels;
			}

			function generateDays(year, month) {
				year = parseInt(year, 10);
				month = parseInt(month, 10);
				var days = [],
					numDays = lib.date.getDaysInMonth(year, month),
					numDaysInPrevMonth = lib.date.getDaysInMonth(year, month-1),
					startDay = lib.date.getFirstDayInMonth(year, month) -
					regional.firstDay,
					numRows = Math.ceil(numDays/7),
					selectedIsVisible = (year === parseInt(scope._selectedDate.year,10) &&
					month === parseInt(scope._selectedDate.month,10)),
					todayIsVisible = (year === lib.date.getCurrentFullYear() &&
					month === lib.date.getCurrentMonth()),
					row, col;
				for ( row = 0; row < numRows; ++row) {
					for ( col = 0; col < 7; ++col) {
						var i = row*7+col,
							day = i - startDay + 1,
							tempRow = null,
							newDate;

						if ( col === 0) {
							lib.adsafe.set(days, row, []);
						}
						if ( day > 0 && day <= numDays) {
							//days[row][col] = {...}
							var klass = '';
							if ( todayIsVisible) {
								//notice the trailing space
								klass += (day === _currentDay ? 'today ' : '');
							}
							if ( selectedIsVisible) {
								klass += (day === parseInt(scope._selectedDate.day,10) ?
										'selected' : '');
							}
							tempRow = lib.adsafe.get(days, row);
							lib.adsafe.set(
								tempRow,
								col,
								{
									year: year,
									month: month,
									day: day,
									klass: klass
								}
							);
						} else if ( day <= 0) { //days from the previous month
							newDate = getRelativeMonth(year, month, -1);
							//days[row][col] = {...}
							tempRow = lib.adsafe.get(days, row);
							lib.adsafe.set(
								tempRow,
								col,
								{
									year: newDate.year,
									month: newDate.month,
									day: numDaysInPrevMonth + day,
									klass: 'other-month'
								}
							);
						} else if ( day > numDays) { //days from the next month
							newDate = getRelativeMonth(year, month, 1);
							//days[row][col] = {...}
							tempRow = lib.adsafe.get(days, row);
							lib.adsafe.set(
								tempRow,
								col,
								{
									year: newDate.year,
									month: newDate.month,
									day: day - numDays,
									klass: 'other-month'
								}
							);
						}
					}
				}
				return days;
			}

			function regenerate() {
				scope.monthLabel = lib.adsafe.get(
						regional.monthNamesShort, scope.month);
				scope.days = generateDays(scope.year,scope.month);
			}

			//select today by default
			scope._selectedDate = lib.date.dateStringToObject('today');
			scope.year = scope._selectedDate.year;
			scope.month = scope._selectedDate.month;
			scope.day = scope._selectedDate.day;
			scope.dayLabels = generateLabels(scope.year,scope.month);
			scope.showDatepicker = false;

			scope.$watch('year + month', regenerate);

			scope.select = function(option) {
				var month = option.month+1,
					day = option.day;

				if ( month < 10) {
					month = '0'+month;
				}
				if ( day < 10) {
					day = '0'+day;
				}

				option = option.year + '-' + month + '-' + day;
				lib.talk.broadcastGlobal('ui-broadcast-date-select-item', {
					name: option,
					value: option,
					$instanceid: scope.$instanceid
				});
			};

			scope.clear = function() {
				scope._selectedDate = '';
				lib.talk.broadcastGlobal('ui-broadcast-date-select-item', {
					name: '',
					value: '',
					$instanceid: scope.$instanceid
				});
			};

			scope.prevYear = function() {
				scope.year = getRelativeYear(scope.year, -1);
			};
			scope.nextYear = function() {
				scope.year = getRelativeYear(scope.year, 1);
			};
			scope.prevMonth = function() {
				var newDate = getRelativeMonth(scope.year, scope.month, -1);
				scope.month = newDate.month;
				scope.year = newDate.year;
			};
			scope.nextMonth = function() {
				var newDate = getRelativeMonth(scope.year, scope.month, 1);
				scope.month = newDate.month;
				scope.year = newDate.year;
			};

			lib.talk.subscribeGlobal('ui-broadcast-date-select-open', function(data) {
				scope.showDatepicker = true;

				var _selectedDate = lib.date.dateStringToObject(data._selectedDate);
				scope._selectedDate = _selectedDate;
				scope.year = _selectedDate.year;
				scope.month = _selectedDate.month;
				scope.day = _selectedDate.day;
				scope.$instanceid = data.$instanceid;

				// for some reason $watch/$digest is not triggered here,
				// so I have to call this by hand
				regenerate();
				scope.$safeDigest();
			});

			lib.talk.subscribeGlobal(
					'ui-broadcast-date-select-close', function(data) {
				scope.showDatepicker = false;
				scope.$safeDigest();
			});
		}
	};
}
*/
