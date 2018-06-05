describe('ts.ui.tablerows.edbml.js', function likethis() {
	function gethtml(table, rows, cols) {
		return ts.ui.tablerows.edbml(table, rows, cols);
	}

	it('should contain tr (Object)', function() {
		var table = new ts.ui.TableModel(),
			rows = [{ cells: [{}] }],
			cols = [new ts.ui.TableColModel()];
		expect(gethtml(table, rows, cols)).toContain('<tr data-index=');
		expect(gethtml(table, rows, cols)).toContain('ts-table-cell');
	});

	it('should contain ts-table-checkbox', function() {
		var table = new ts.ui.TableModel({ selectable: true }),
			rows = [{ cells: [{}, {}, {}] }],
			cols = ['One', 'Two', 'Three'];
		expect(gethtml(table, rows, cols)).toContain('ts-table-checkbox');
	});

	it('should contain editable textarea', function() {
		var table = new ts.ui.TableModel({ editable: true }),
			rows = [{ cells: [{ editable: true, valid: false }, {}, {}] }],
			cols = ['One', 'Two', 'Three'];
		expect(gethtml(table, rows, cols)).toContain('<div class="ts-table-line"');
		expect(gethtml(table, rows, cols)).toContain(
			'<textarea rows="1" data-ts="TextArea" class="ts-table-input" type="submit">'
		);
		expect(gethtml(table, rows, cols)).toContain('ts-editable');
		expect(gethtml(table, rows, cols)).toContain('ts-table-invalid');
	});
});
