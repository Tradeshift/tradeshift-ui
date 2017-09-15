describe('ts.ui.pager.edbml', function() {
	function gethtml() {
		return ts.ui.pager.edbml(new ts.ui.PagerModel());
	}

	it('should contain ts-paper', function() {
		expect(gethtml()).toContain('<div data-ts="Pager"');
	});
});
