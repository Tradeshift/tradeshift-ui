describe('ts.ui.switch.edbml', function likethis() {
	function gethtml() {
		return ts.ui.switchonly.edbml();
	}

	it('should contain ts-switcher and icons', function() {
		expect(gethtml()).toContain('ts-switcher');
		expect(gethtml()).toContain('<i class="ts-icon-cancel"></i>');
		expect(gethtml()).toContain('<i class="ts-icon-checked"></i>');
	});
});
