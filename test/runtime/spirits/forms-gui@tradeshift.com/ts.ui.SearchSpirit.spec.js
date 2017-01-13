describe('ts.ui.SearchSpirit', function likethis() {
	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div[data-ts=Search]'));
			action(spirit, dom);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div data-ts="Search"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.SearchSpirit);
				expect(dom.querySelector('button[ts-button]').innerHTML).toContain('ts-icon-close');
				expect(dom.querySelector('input[ts-input]').value).toBe('');
				expect(spirit.element.className).toContain('ts-empty');
				done();
			});
		}, html, done);
	});

	it('should contain value', function(done) {
		var html = '<div data-ts="Search"></div>';
		setup(function(spirit, dom) {
			spirit.value = 'Leo';
			sometime(function later() {
				expect(dom.querySelector('input[ts-input]').value).toBe('Leo');
				expect(dom.querySelector('button[ts-button]').className).not.toContain('ts-hidden');
				done();
			});
		}, html, done);
	});
});
