describe('ts.ui.tablecheck.edbml', function likethis() {
	function gethtml(table, row, fixed) {
		return ts.ui.tablecheck.edbml(table, row, fixed);
	}

	it('should contain ts-table-checkbox', function() {
		var table = {},
			row = {},
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('ts-table-checkbox');
		expect(gethtml(table, row, fixed)).toContain('ts-table-cell');
		expect(gethtml(table, row, fixed)).toContain('ts-table-checkbox-button');
	});

	it('should contain ts-icon-checkboxon', function() {
		var table = {},
			row = { selected: true },
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('ts-icon-checkboxon');
	});

	it('should contain ts-icon-checkbox', function() {
		var table = {},
			row = { selected: false },
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('ts-icon-checkbox');
		expect(gethtml(table, row, fixed)).not.toContain('ts-icon-checkboxon');
	});

	it('should contain fixed', function() {
		var table = {},
			row = {},
			fixed = true;
		expect(gethtml(table, row, fixed)).toContain('-fixed-');
		expect(gethtml(table, row, fixed)).not.toContain('-floating-');
	});

	it('should contain floating', function() {
		var table = {},
			row = {},
			fixed = false;
		expect(gethtml(table, row, fixed)).toContain('-floating-');
		expect(gethtml(table, row, fixed)).not.toContain('-fixed-');
	});
});
