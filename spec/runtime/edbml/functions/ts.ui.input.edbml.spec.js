describe('ts.ui.input.edbml', function likethis() {
	function gethtml() {
		return ts.ui.input.edbml(
			new ts.ui.InputModel({
				label: 'Hest',
				readonly: true,
				autofocus: true,
				required: true,
				disabled: true,
				placeholder: true
			})
		);
	}

	it('should contain an input', function() {
		expect(gethtml()).toContain('<input');
	});

	it('should contain a label', function() {
		expect(gethtml()).toContain('Hest');
	});

	it('should contain a group container', function() {
		expect(gethtml()).toContain('<fieldset');
	});

	it('should be readonly', function() {
		expect(gethtml()).toContain('readonly');
	});

	it('should have autofocus', function() {
		expect(gethtml()).toContain('autofocus');
	});

	it('should be required', function() {
		expect(gethtml()).toContain('required');
	});

	it('should be disabled', function() {
		expect(gethtml()).toContain('disabled');
	});

	it('should be placeholder', function() {
		expect(gethtml()).toContain('placeholder');
	});
});
