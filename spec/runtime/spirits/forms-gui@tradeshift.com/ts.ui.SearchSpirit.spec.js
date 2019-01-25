describe('ts.ui.SearchSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Search]'));
			action(spirit, dom);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div data-ts="Search"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(ts.ui.SearchSpirit.is(spirit)).toBe(true);
				expect(dom.querySelector('.ts-button').innerHTML).toContain('ts-icon-remove');
				expect(dom.querySelector('.ts-input').value).toBe('');
				expect(spirit.element.className).toContain('ts-empty');
				done();
			});
		}, html);
	});

	it('should contain value', function(done) {
		var html = '<div data-ts="Search"></div>';
		setup(function(spirit, dom) {
			spirit.value = 'Leo';
			sometime(function later() {
				expect(dom.querySelector('.ts-button').className).not.toContain('ts-hidden');
				expect(dom.querySelector('.ts-input').value).toBe('Leo');
				done();
			});
		}, html);
	});
});
