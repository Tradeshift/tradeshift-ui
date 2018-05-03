describe('ts.ui.TableSpirit.edbml', function likethis() {
	function getDom(html) {
		var dom = helper.createTestDom();
		dom.innerHTML = html;
		return dom;
	}

	function getspirit() {
		var then = new gui.Then(),
			dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="Table"></div>';
		sometime(function later() {
			var footer = dom.querySelector('.ts-table');
			then.now(ts.ui.get(footer));
		});
		return then;
	}

	it('should contain table', function(done) {
		var dom = getDom('<div data-ts="Table"></div>');
		sometime(function later() {
			expect(dom.innerHTML).toContain('ts-spirit');
			expect(dom.innerHTML).toContain('<table><thead>');
			expect(dom.innerHTML).toContain('ts-table-body');
			expect(dom.innerHTML).toContain('ts-table-rows');
			done();
		});
	});

	it('should contain a footer', function(done) {
		getspirit().then(function(spirit) {
			spirit.configbutton();
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-table-foot');
				done();
			});
		});
	});
});
