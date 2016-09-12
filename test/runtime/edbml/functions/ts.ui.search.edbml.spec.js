describe('ts.ui.search.edbml', function() {
	function gethtml(inset) {
		return ts.ui.search.edbml(
			new ts.ui.SearchModel({
				inset: inset
			})
		);
	}

	it('should contain data-ts="Search"', function() {
		expect(gethtml(false)).toContain('<span data-ts="Search"');
	});

	it('should contain ts-inset', function() {
		expect(gethtml(true)).toContain('ts-inset');
	});

	it('should not contain ts-inset', function() {
		expect(gethtml(false)).not.toContain('ts-inset');
	});
});
