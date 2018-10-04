ts.ui.ready(function() {
	ts.ui.get('#myaside').open();
	setTimeout(function postponed() {
		// make sure we get all measurements
		var times = gui.$measurements();
		document.querySelector('#metrics').innerHTML =
			'<table>' +
			times
				.map(function(m) {
					return '<tr><td>' + m.name + '</td><td>' + Math.round(m.duration) + '</td></tr>';
				})
				.join('') +
			'</table>';
	});
});
