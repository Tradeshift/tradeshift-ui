describe('ts.ui.LabelSpirit', function likethis() {

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = '<input data-ts="Label"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.LabelSpirit);
			done();
		});
	});

});
