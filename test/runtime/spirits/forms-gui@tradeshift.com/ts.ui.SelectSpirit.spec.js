describe('ts.ui.SelectSpirit', function likethis() {
	var MARKUP = [
		'<select data-ts="Select">',
		'<option value="1">One</option>',
		'<option value="2">Two</option>',
		'<option value="3">Three</option>',
		'</select>'
	].join('\n');

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('select'));
			expect(spirit.constructor).toBe(ts.ui.SelectSpirit);
			done();
		});
	});

	it('should insert the FakeSelectInputSpirit (fake select)', function(done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			var fake = ts.ui.get(dom.querySelector('select + input'));
			expect(fake.constructor).toBe(ts.ui.FakeSelectInputSpirit);
			done();
		});
	});
});
