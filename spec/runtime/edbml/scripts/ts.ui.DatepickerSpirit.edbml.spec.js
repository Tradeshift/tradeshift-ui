describe('ts.ui.DatepickerSpirit.edbml', function likethis() {
	var datePicker = ts.ui.DatePicker({
		title: 'Your Birthday',
		value: '1973-03-26',
		onselect: function(newval, oldval) {}
	});

	it('should contain header', function() {
		expect(datePicker.title).toEqual('Your Birthday');
	});

	it('should change the isOpen to be true', function() {
		datePicker.open();
		expect(datePicker.isOpen).toBe(true);
	});

	it('should change the isOpen to be false', function() {
		datePicker.close();
		expect(datePicker.isOpen).toBe(false);
	});

	it('could open again', function() {
		datePicker.open();
		expect(datePicker.isOpen).toBe(true);
		datePicker.close();
	});
});
