ts.ui.ready(function() {
	$.getJSON('assets/rowdata.json', function(json) {
		ts.ui.get('#table1', function(table) {
			table.selectable();
			table
				.cols([
					{ label: 'flex:1', flex: 1 },
					{ label: 'flex:2', flex: 2 },
					{ label: 'width:88', width: 88 }
				])
				.rows(json)
				.max(5);
		});

		ts.ui.get('#table2', function(table) {
			table
				.cols([
					{ label: 'Default' },
					{ label: 'width:88', width: 88 },
					{ label: 'width:88', width: 88 }
				])
				.rows(json)
				.max(5);
		});

		ts.ui.get('#table3', function(table) {
			table
				.cols([
					{ label: 'Default' },
					{ label: 'width:88', width: 88 },
					{ label: 'min-width:220', width: 220 }
				])
				.rows(json)
				.max(5);
		});

		ts.ui.get('#table4', function(table) {
			table
				.cols([
					{ label: 'minwidth:88', minwidth: 88 },
					{ label: 'minwidth:352', minwidth: 352 },
					{ label: 'minwidth:352', minwidth: 352 }
				])
				.rows(json)
				.max(5);
		});
	});
});
