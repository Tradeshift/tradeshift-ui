describe('ts.ui.MenuSpirit', function likethis() {
	function setup(action, html) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('menu'));
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<menu data-ts="Menu"></menu>';
		setup(function(spirit) {
			sometime(function later() {
				expect(ts.ui.MenuSpirit.is(spirit)).toBe(true);
				done();
			});
		}, html);
	});

	it('should show a blocking spinner via DOM attribute', function(done) {
		var html =
			'<menu data-ts="Menu"><li><button><span>Moth</span><sub>Leo</sub><i class="ts-icon-rating"></i></button></li></menu>';
		setup(function(spirit) {
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Moth');
				expect(spirit.element.innerHTML).toContain('Leo');
				expect(spirit.element.innerHTML).toContain('ts-icon-rating');
				done();
			});
		}, html);
	});
});
