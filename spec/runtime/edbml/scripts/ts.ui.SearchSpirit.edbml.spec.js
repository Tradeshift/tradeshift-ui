describe('ts.ui.PagerSpirit.edbml', function likethis() {
	it('should contain input', function(done) {
		var html = '<div data-ts="Search" class="ts-inset"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<input');
			done();
		});
	});

	it('should contain button', function(done) {
		var html = '<div data-ts="Search" class="ts-inset"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<button');
			done();
		});
	});

	it('should contain close icon', function(done) {
		var html = '<div data-ts="Search" class="ts-inset"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<i class="ts-icon-close"></i>');
			done();
		});
	});

	it('should contain tip', function(done) {
		var html = '<div data-ts="Search" tip="leo"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('leo');
			done();
		});
	});
});
