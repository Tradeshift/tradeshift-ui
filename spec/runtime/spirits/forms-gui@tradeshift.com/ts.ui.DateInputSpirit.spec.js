describe('ts.ui.DateInputSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<input data-ts="DateInput"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.DateInputSpirit);
			done();
		});
	});
});
