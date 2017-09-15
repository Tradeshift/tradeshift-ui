describe('ts.ui.FieldSetSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<fieldset data-ts="FieldSet"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('fieldset'));
			expect(spirit.constructor).toBe(ts.ui.FieldSetSpirit);
			done();
		});
	});
});
