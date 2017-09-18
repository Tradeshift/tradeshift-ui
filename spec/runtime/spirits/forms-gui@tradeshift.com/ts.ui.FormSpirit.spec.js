describe('ts.ui.FormSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<form data-ts="Form"></form>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('form'));
			expect(spirit.constructor).toBe(ts.ui.FormSpirit);
			done();
		});
	});

	it('should summon with FORM and classname', function() {
		var dom = helper.createTestDom(ts.ui.FormSpirit);
		expect(dom.innerHTML).toContain('<form');
		expect(dom.innerHTML).toContain('ts-form');
	});

	it('should attach a default action', function() {
		var dom = helper.createTestDom(ts.ui.FormSpirit);
		expect(dom.innerHTML).toContain(ts.ui.FormSpirit.ACTION_DEFAULT);
	});
});
