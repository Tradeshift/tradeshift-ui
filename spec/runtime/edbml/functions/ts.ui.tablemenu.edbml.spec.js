describe('ts.ui.tablemenu.edbml', function likethis() {
	function gethtml(table) {
		return ts.ui.tablemenu.edbml(table);
	}

	it('should contain ts-table-menu', function() {
		var table = new ts.ui.TableModel();
		expect(gethtml(table)).toContain('ts-table-menu');
		expect(gethtml(table)).toMatch(/<th class=\"ts-table-checkbox([^"]*)"/);
		expect(gethtml(table)).toContain('<button data-action="selection-menu"');
	});

	it('should contain ts-open', function() {
		var table = new ts.ui.TableModel({ menuopen: true });
		expect(gethtml(table)).toContain('ts-open');
		expect(gethtml(table)).toContain('<th class="ts-table-choices">');
		expect(gethtml(table)).toContain('<th class="ts-table-choices-close">');
	});

	it('should not contain ts-open', function() {
		var table = new ts.ui.TableModel({ menuopen: false });
		expect(gethtml(table)).not.toContain('ts-open');
		expect(gethtml(table)).not.toContain('<th class="ts-table-choices">');
		expect(gethtml(table)).not.toContain('<th class="ts-table-choices-close">');
	});

	it('should contain ts-icon-checkboxon', function() {
		var table = new ts.ui.TableModel();
		spyOn(table, 'isVisibleRowSelected').and.returnValue(true);
		expect(gethtml(table)).toContain('class="ts-icon-checkboxon');
		expect(gethtml(table)).not.toMatch(/class=\"ts-icon-checkbox([ \"])/);
	});

	it('should contain ts-icon-checkbox', function() {
		var table = new ts.ui.TableModel();
		spyOn(table, 'isVisibleRowSelected').and.returnValue(false);
		expect(gethtml(table)).toMatch(/class=\"ts-icon-checkbox([ \"])/);
		expect(gethtml(table)).not.toContain('class="ts-icon-checkboxon');
	});
});
