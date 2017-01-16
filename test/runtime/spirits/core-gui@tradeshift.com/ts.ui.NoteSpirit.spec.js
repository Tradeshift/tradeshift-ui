describe('ts.ui.NoteSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Note]'));
			action(spirit);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div ts-data-ts="Note"></div>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.NoteSpirit);
				done();
			});
		}, html, done);
	});

	it('should contain icon', function(done) {
		var html = '<div data-ts="Note"><i class="ts-icon-heart"></i></div>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-icon-heart');
				done();
			});
		}, html, done);
	});

	it('should contain text', function(done) {
		var html = '<div data-ts="Note"><p>leo</p></div>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('leo');
				done();
			});
		}, html, done);
	});
});
