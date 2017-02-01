describe('ts.ui.PagerSpirit.edbml', function likethis() {
	var html = '<div data-ts="Pager" data-ts.pages="8" data-ts.page="0"></div>';

	function getDom() {
		var dom = helper.createTestDom();
		dom.innerHTML = html;
		return dom;
	}

	it('should contain menu', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('<menu>');
			done();
		});
	});

	it('should contain disabled', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('disabled="disabled"');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-first', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-pager-jump ts-pager-first');
			done();
		});
	});

	it('should contain skip-previous', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('skip-previous');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-prev', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-pager-jump ts-pager-prev');
			done();
		});
	});

	it('should contain fast-rewind', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('fast-rewind');
			done();
		});
	});

	it('should contain ts-pager-step', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-pager-step');
			done();
		});
	});

	it('should contain 1 to 5', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('1');
			expect(dom.innerHTML).toContain('2');
			expect(dom.innerHTML).toContain('3');
			expect(dom.innerHTML).toContain('4');
			expect(dom.innerHTML).toContain('5');
			done();
		});
	});

	it('should contain ts-selected', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-selected');
			done();
		});
	});

	it('should contain ts-more', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-more');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-next', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-pager-jump ts-pager-next');
			done();
		});
	});

	it('should contain fast-forward', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('fast-forward');
			done();
		});
	});

	it('should contain ts-pager-jump ts-pager-last', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-pager-jump ts-pager-last');
			done();
		});
	});

	it('should contain skip-next', function(done) {
		var dom = getDom();
		sometime(function later() {
			expect(dom.innerHTML).toContain('skip-next');
			done();
		});
	});
});
