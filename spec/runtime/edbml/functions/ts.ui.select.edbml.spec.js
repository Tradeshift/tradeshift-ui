describe('ts.ui.select.edbml', function likethis() {
	function gethtml() {
		return ts.ui.select.edbml(
			new ts.ui.SelectModel({
				options: [{ value: 1, text: 'test' }]
			})
		);
	}

	it('should contain select', function() {
		expect(gethtml()).toContain('<select');
	});

	it('should contain option', function() {
		expect(gethtml()).toContain('value="1">test');
	});
});
