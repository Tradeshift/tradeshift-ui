describe('ts.ui.TopBar', function likethis() {
	// Expectations ..............................................................

	it('should be chainable', function() {
		expect(
			ts.ui.TopBar
				.title('Hest')
				.tabs([])
				.buttons([])
				.green()
				.blue()
				.showBack(function() {})
				.showNext(function() {})
				.hideBack()
				.hideNext()
				.hide()
				.show()
		).toBe(ts.ui.TopBar);
	});
});
