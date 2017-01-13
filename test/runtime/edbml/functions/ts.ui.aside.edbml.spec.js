describe('ts.ui.aside.edbml', function likethis() {
	it('should contain a panel', function() {
		var html = ts.ui.aside.edbml();
		expect(html).toContain('data-ts="Panel"');
	});
});
