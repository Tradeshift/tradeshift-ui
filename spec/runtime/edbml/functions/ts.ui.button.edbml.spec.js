describe('ts.ui.button.edbml', function likethis() {
	// @param {boolean} icononly
	function gethtml(icononly) {
		return ts.ui.button.edbml(
			new ts.ui.ButtonModel({
				icon: 'ts-icon-hest',
				label: icononly ? null : 'Hest'
			})
		);
	}

	it('should contain a button', function() {
		expect(gethtml()).toContain('data-ts="Button"');
	});

	it('should contain a label', function() {
		expect(gethtml()).toContain('<span>Hest</span>');
	});

	it('should contain an icon', function() {
		expect(gethtml(true)).toContain('ts-icon-hest');
	});

	// label should override the icon - never show both!
	it('should not contain an icon', function() {
		expect(gethtml()).not.toContain('ts-icon-hest');
	});
});
