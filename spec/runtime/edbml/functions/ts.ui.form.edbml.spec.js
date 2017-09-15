describe('ts.ui.form.edbml', function likethis() {
	it('should contain a form', function() {
		var html = ts.ui.form.edbml();
		expect(html).toContain('data-ts="Form"');
	});

	it('should contain an input field', function() {
		var html = ts.ui.form.edbml(
			new ts.ui.FormModel({
				items: [
					{
						item: 'input'
					}
				]
			})
		);
		expect(html).toContain('<input');
	});

	it('should contain a submit button', function() {
		var html = ts.ui.form.edbml(new ts.ui.FormModel({}).submitButton('Login')); // this API will change!
		expect(html).toContain('<button');
	});
});
