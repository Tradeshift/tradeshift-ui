ts.ui.DatePicker.localize({
	firstDay: 1,
	monthNames: [
		'Január',
		'Február',
		'Március',
		'Április',
		'Május',
		'Június',
		'Július',
		'Augusztus',
		'Szeptember',
		'Október',
		'November',
		'December'
	],
	monthNamesShort: [
		'Jan',
		'Feb',
		'Már',
		'Ápr',
		'Máj',
		'Jún',
		'Júl',
		'Aug',
		'Sze',
		'Okt',
		'Nov',
		'Dec'
	],
	dayNames: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
	dayNamesShort: ['Vas', 'Hét', 'Ked', 'Sze', 'Csü', 'Pén', 'Szo'],
	dayNamesMin: ['Va', 'Hé', 'Ke', 'Sze', 'Cs', 'Pé', 'Szo'],
	deselect: 'Törölje'
});
ts.ui.Autocomplete.localize({
	matchString: function(count) {
		if (!count) {
			return '';
		} else {
			return count + ' találat';
		}
	}
});
ts.ui.Footer.localize({
	collaboration: 'Nyissa Meg Az Együttműködést'
});
