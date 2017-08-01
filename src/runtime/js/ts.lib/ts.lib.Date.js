/**
 * Date functions.
 * @see Tradeshift/Apps/master/src/main/apps/Lib/components/Date/code/Date.js
 */
ts.lib.Date = (function() {
	var regionalDateFormats = [];

	regionalDateFormats['en-US'] = 'mm/dd/yy';
	regionalDateFormats['en-GB'] = 'dd/mm/yy';
	regionalDateFormats.da = 'dd-mm-yy';
	regionalDateFormats.hu = 'yy.mm.dd.';

	// this should be set by the localization engine
	var regionalDateFormat = regionalDateFormats['en-US'];

	function zf(num) {
		if (num < 10) {
			return '0' + num;
		}
		return '' + num;
	}

	function _getDateString(date) {
		if (typeof date === 'undefined') {
			date = new Date();
		}
		var month = zf(date.getMonth() + 1),
			day = zf(date.getDate());
		return date.getFullYear() + '-' + month + '-' + day;
	}

	function _getDateTimeString(date) {
		if (typeof date === 'undefined') {
			date = new Date();
		}
		var hour = zf(date.getHours()),
			min = zf(date.getMinutes()),
			sec = zf(date.getSeconds());
		return _getDateString(date) + ' ' + hour + ':' + min + ':' + sec;
	}

	function _dateStringToObject(dateString) {
		if (dateString.length !== 10) {
			// yyyy-mm-dd
			return {
				year: _getCurrentFullYear(),
				month: _getCurrentMonth(),
				day: _getCurrentDay()
			};
		}
		var dateArray = dateString.split('-');
		return {
			year: parseInt(dateArray[0], 10),
			month: parseInt(dateArray[1] - 1, 10),
			day: parseInt(dateArray[2], 10)
		};
	}

	function _getCurrentFullYear() {
		return parseInt(new Date().getFullYear(), 10);
	}

	function _getCurrentMonth() {
		return parseInt(new Date().getMonth(), 10);
	}

	function _getCurrentDay() {
		return parseInt(new Date().getDate(), 10);
	}

	function _getLocalizedDateString(date) {
		var dateObj;
		if (typeof date === 'string') {
			dateObj = _dateStringToObject(date);
		} else {
			dateObj = date;
		}
		var year = dateObj.year,
			month = dateObj.month + 1,
			day = dateObj.day;
		if (month < 10) {
			month = '0' + month;
		} else {
			month = '' + month;
		}
		if (day < 10) {
			day = '0' + day;
		} else {
			day = '' + day;
		}
		year = '' + year;
		var prevChar = 'x',
			returnDate = '';
		for (
			var i = 0, regionalDateFormatLength = regionalDateFormat.length;
			i < regionalDateFormatLength;
			++i
		) {
			var currentChar = regionalDateFormat[i];
			if (currentChar === 'y') {
				returnDate += year.substr(prevChar === 'y' ? 3 : 2, 1);
			} else if (currentChar === 'm') {
				returnDate += month.substr(prevChar === 'm' ? 1 : 0, 1);
			} else if (currentChar === 'd') {
				returnDate += day.substr(prevChar === 'd' ? 1 : 0, 1);
			} else {
				returnDate += currentChar;
			}
			prevChar = currentChar;
		}
		return returnDate;
	}

	return {
		// Public ...........................................................

		/**
		 * Get a localized date string
		 * @param {Object|String} date {year,month,day} or yyyy-mm-dd.
		 */
		getLocalizedDateString: _getLocalizedDateString,

		/**
		 * Get a date string relative to today
		 * @param {int} diffDays number of days from today.
		 */
		dateStringRelativeToNow: function(diffDays) {
			var currentDate = new Date(),
				currentYear = currentDate.getFullYear(),
				currentMonth = currentDate.getMonth(),
				currentDay = currentDate.getDate();
			return _getDateString(new Date(currentYear, currentMonth, currentDay + diffDays));
		},

		/**
		 * Get current full year (eg: 1986)
		 */
		getCurrentFullYear: _getCurrentFullYear,

		/**
		 * Get current month (eg: 12)
		 */
		getCurrentMonth: _getCurrentMonth,

		/**
		 * Get current day (eg: 19)
		 */
		getCurrentDay: _getCurrentDay,

		/**
		 * Get current timestamp in miliseconds
		 */
		getCurrentTimestamp: function() {
			return new Date().getTime();
		},

		/**
		 * Get number of days in a certain month
		 */
		getDaysInMonth: function(year, month) {
			return parseInt(32 - new Date(year, month, 32).getDate(), 10);
		},

		/**
		 * Get first day in a month (0 - Sunday, 1 - Monday, etc..)
		 */
		getFirstDayInMonth: function(year, month) {
			return parseInt(new Date(year, month, 1).getDay(), 10);
		},

		/**
		 * Get an object from a date string
		 * and returns today if something goes wrong
		 * remember that this is for javascript, so months go from 0-11
		 * @type {String} yyyy-mm-dd.
		 */
		dateStringToObject: _dateStringToObject,

		/**
		 * Get milliseconds from an ISO9601 date string
		 * @param {String} isoDate yyyy-MM-dd'T'HH:mm:ss.SSSZ.
		 * @return {Date}
		 */
		getMillisecondsFromISO: function(isoDate) {
			return Date.parse(isoDate);
		},

		/**
		 * @return {string}
		 */
		getDateString: _getDateString,

		/**
		 * @return {string}
		 */
		getDateTimeString: _getDateTimeString,

		/**
		 * @return {string}
		 */
		getCurrentDateString: function() {
			return _getDateString(new Date());
		}
	};
})();
