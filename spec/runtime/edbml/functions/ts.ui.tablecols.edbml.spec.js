describe('ts.ui.tablecols.edbml', function likethis() {
	function gethtml(table, cols) {
		return ts.ui.tablecols.edbml(table, cols);
	}

	it('should contain ts-table-checkbox', function() {
		var table = { selectable: true },
			cols = [{}, {}];
		expect(gethtml(table, cols)).toContain('ts-table-checkbox');
	});

	it('should contain col.type', function() {
		var table = {},
			cols = [{ type: 'ts-ui-col' }];
		expect(gethtml(table, cols)).toContain('ts-ui-col');
		expect(gethtml(table, cols)).not.toContain('ts-selected');
	});

	it('should contain ts-selected', function() {
		var table = {},
			cols = [{ selected: true }];
		expect(gethtml(table, cols)).toContain('ts-selected');
	});

	it('should contain search component', function() {
		var table = {},
			col = new ts.ui.TableColModel({ search: { hidden: false } }),
			cols = [col];
		expect(gethtml(table, cols)).toContain('<span data-ts="Search"');
	});

	it('should not contain search component', function() {
		var table = {},
			col = new ts.ui.TableColModel({ search: { hidden: true } }),
			cols = [col];
		expect(gethtml(table, cols)).not.toContain('<span data-ts="Search"');
	});

	it('should contain button component', function() {
		var table = {},
			col = new ts.ui.TableColModel({ button: { hidden: false } }),
			cols = [col];
		expect(gethtml(table, cols)).toContain('<button data-ts="Button"');
	});

	it('should not contain button component', function() {
		var table = {},
			col = new ts.ui.TableColModel({ button: { hidden: true } }),
			cols = [col];
		expect(gethtml(table, cols)).not.toContain('<button ts-button');
	});

	it('should contain ts-icon-triangledown', function() {
		var table = {},
			cols = [{ ascending: true }];
		expect(gethtml(table, cols)).toContain('ts-icon-triangledown');
		expect(gethtml(table, cols)).not.toContain('ts-icon-triangleup');
	});

	it('should contain ts-icon-triangleup', function() {
		var table = {},
			cols = [{ ascending: false }];
		expect(gethtml(table, cols)).toContain('ts-icon-triangleup');
		expect(gethtml(table, cols)).not.toContain('ts-icon-triangledown');
	});

	it('should contain label', function() {
		var table = {},
			cols = [{ label: 'leo' }];
		expect(gethtml(table, cols)).toContain('<span>leo</span>');
	});
});
