describe('ts.ui.UserImageSpirit', function likethis() {
	function setup(action, html) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('img[data-ts=UserImage]'));
			action(spirit, dom);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<img data-ts="UserImage" alt="Karl Benson"/>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(ts.ui.UserImageSpirit.is(spirit)).toBe(true);
				expect(spirit.element.className).toContain('ts-userimage');
				done();
			});
		}, html);
	});

	it('should have title', function(done) {
		var html = '<img data-ts="UserImage" alt="Karl Benson"/>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(spirit.element.getAttribute('title')).toBe('Karl Benson');
				done();
			});
		}, html);
	});
});
