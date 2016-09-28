if(window.ts && ts.ui && ts.ui.DatePicker) {
	ts.ui.DatePicker.localize({
		firstDay: 1,
		monthNames: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		],
		monthNamesShort: [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		],
		dayNames: [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		],
		dayNamesShort: [
			'Sun',
			'Mon',
			'Tue',
			'Wed',
			'Thu',
			'Fri',
			'Sat'
		],
		dayNamesMin: [
			'Su',
			'Mo',
			'Tu',
			'We',
			'Th',
			'Fr',
			'Sa'
		]
	});
}

if (window.ts && ts.ui && ts.ui.Autocomplete) {
	ts.ui.Autocomplete.localize({
		matchString: function(count) {
			if (!count) {
				return '';
			} else if (count === 1) {
				return '1 match';
			} else {
				return count + ' matches';
			}
		}
	});
}
