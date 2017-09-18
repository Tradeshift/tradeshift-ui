describe('ts.ui.buttons.edbml', function likethis() {
	function gethtml() {
		return ts.ui.buttons.edbml(
			new ts.ui.ButtonCollection([
				{
					icon: 'ts-icon-hest',
					label: 'Hest1'
				},
				{
					icon: 'ts-icon-hest',
					label: 'Hest2'
				}
			])
		);
	}

	it('should contain a span', function() {
		expect(gethtml()).toContain('<span class="ts-join">');
	});

	it('should contain button', function() {
		expect(gethtml()).toContain('data-ts="Button"');
	});
});
