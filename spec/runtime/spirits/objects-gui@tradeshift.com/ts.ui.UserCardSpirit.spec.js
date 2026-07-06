describe('ts.ui.UserCardSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="UserCard"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			expect(ts.ui.UserCardSpirit.is(spirit)).toBe(true);
			done();
		});
	});
});
