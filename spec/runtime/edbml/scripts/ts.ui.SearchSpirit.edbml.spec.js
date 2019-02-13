describe('ts.ui.SearchSpirit.edbml', function likethis() {
	function getDom(html) {
		var dom = helper.createTestDom();
		dom.innerHTML = html;
		return dom;
	}

	it('should contain input', function(done) {
		var dom = getDom('<div data-ts="Search" class="ts-inset"></div>');
		sometime(function later() {
			expect(dom.innerHTML).toContain('<input');
			done();
		});
	});

	it('should contain button', function(done) {
		var dom = getDom('<div data-ts="Search" class="ts-inset"></div>');
		sometime(function later() {
			expect(dom.innerHTML).toContain('<button');
			done();
		});
	});

	it('should contain remove (clear) icon', function(done) {
		var dom = getDom('<div data-ts="Search" class="ts-inset"></div>');
		sometime(function later() {
			expect(dom.innerHTML).toContain('<i class="ts-icon-remove"></i>');
			done();
		});
	});

	it('should contain tip', function(done) {
		var dom = getDom('<div data-ts="Search" tip="leo"></div>');
		sometime(function later() {
			expect(dom.innerHTML).toContain('leo');
			done();
		});
	});
});
