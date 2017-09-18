describe('ts.ui.NoteSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div'));
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div data-ts="Note"></div>';
		setup(function(spirit) {
			sometime(function later() {
				expect(ts.ui.NoteSpirit.is(spirit)).toBe(true);
				done();
			});
		}, html);
	});
});
