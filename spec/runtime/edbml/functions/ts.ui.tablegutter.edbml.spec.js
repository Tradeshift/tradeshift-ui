describe('ts.ui.tablegutter.edbml', function likethis() {
	function gethtml(table, rows) {
		return ts.ui.tablegutter.edbml(table, rows);
	}

	it('should contain ts-table-checkbox', function() {
		var table = {},
			rows = [{}, {}];
		expect(gethtml(table, rows)).toContain('ts-table-checkbox');
	});
});
