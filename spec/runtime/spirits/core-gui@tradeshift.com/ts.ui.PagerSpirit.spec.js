describe('ts.ui.PagerSpirit', function likethis() {
	function setup(action, html) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('.ts-pager'));
			action(spirit, dom);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<div data-ts="Pager"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(ts.ui.PagerSpirit.is(spirit)).toBe(true);
				done();
			});
		}, html);
	});

	it('should select the first page', function(done) {
		var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="0"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(dom.querySelector('.ts-selected').innerHTML).toContain('1');
				expect(dom.querySelector('.ts-pager-first').getAttribute('disabled')).toBe('disabled');
				expect(dom.querySelector('.ts-pager-prev').getAttribute('disabled')).toBe('disabled');
				expect(dom.querySelector('.ts-pager-next').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-last').getAttribute('disabled')).not.toBe('disabled');
				done();
			});
		}, html);
	});

	it('should select the second page', function(done) {
		var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="1"></div>';
		setup(function(spirit, dom) {
			sometime(function later() {
				expect(dom.querySelector('.ts-selected').innerHTML).toContain('2');
				expect(dom.querySelector('.ts-pager-first').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-prev').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-next').getAttribute('disabled')).not.toBe('disabled');
				expect(dom.querySelector('.ts-pager-last').getAttribute('disabled')).not.toBe('disabled');
				done();
			});
		}, html);
	});
});
