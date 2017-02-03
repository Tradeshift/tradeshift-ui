describe('ts.ui.datepicker.edbml', function likethis() {
	it('should contain a calendar, obviously', function() {
		var html = ts.ui.datepicker.edbml();
		expect(html).toContain('data-ts="Calendar"');
	});
});
