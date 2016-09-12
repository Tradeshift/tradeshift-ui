describe('ts.ui.PagerSpirit.edbml', function likethis() {

	var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="0"></div>';
	
	it('should contain menu', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<menu>');
			done();
		});
	});

	it('should contain disabled', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('disabled="disabled" data-jump');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-first', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-first');
			done();
		});
	});

	it('should contain skip-previous', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('skip-previous');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-prev', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-prev');
			done();
		});
	});

	it('should contain fast-rewind', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('fast-rewind');
			done();
		});
	});

	it('should contain ts-pager-step', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-step');
			done();
		});
	});

	it('should contain 1 to 5', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('1');
			expect(helper.gethtml(html)).toContain('2');
			expect(helper.gethtml(html)).toContain('3');
			expect(helper.gethtml(html)).toContain('4');
			expect(helper.gethtml(html)).toContain('5');
			done();
		});
	});

	it('should contain ts-selected', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-selected');
			done();
		});
	});

	it('should contain ts-more', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-more');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-next', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-next');
			done();
		});
	});

	it('should contain fast-forward', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('fast-forward');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-last', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-pager-jump ts-pager-last');
			done();
		});
	});

	it('should contain skip-next', function(done) {
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('skip-next');
			done();
		});
	});

});
