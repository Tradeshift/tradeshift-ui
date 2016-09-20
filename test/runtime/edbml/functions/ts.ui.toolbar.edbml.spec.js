describe('ts.ui.toolbar.edbml', function likethis() {
	function gethtml(toolbar) {
		return ts.ui.toolbar.edbml(new ts.ui.ToolBarModel(toolbar));
	}

	it('should contain ts-toolbar', function() {
		var toolbar = {};
		expect(gethtml(toolbar)).toContain('data-ts="ToolBar"');
	});
});
