describe('ts.ui.buttonsmenu.edbml', function likethis() {
	function gethtml(hasbuttons) {
		var buttons = [
			{
				icon: 'ts-icon-hest',
				label: 'Hest1'
			},
			{
				icon: 'ts-icon-hest',
				label: 'Hest2'
			}
		];
		return ts.ui.buttonsmenu.edbml(
			new ts.ui.ButtonMenuModel({
				items: hasbuttons ? buttons : []
			})
		);
	}

	it('should contain ts-buttons', function() {
		expect(gethtml(true)).toContain('data-ts="Buttons"');
	});

	it('should not contain ts-buttons', function() {
		expect(gethtml(false)).not.toContain('data-ts="Buttons"');
	});
});
