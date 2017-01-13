describe('ts.ui.TableSpirit.edbml', function likethis() {
	function getspirit(html, id) {
		var dom = helper.createTestDom();
		dom.innerHTML = html;
		var spirit = ts.ui.get(dom.querySelector('#' + id));
		return spirit;
	}

	it('should contain table', function(done) {
		var html = '<div data-ts="Table"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('ts-spirit');
			expect(helper.gethtml(html)).toContain('<table><thead>');
			expect(helper.gethtml(html)).toContain('ts-table-body');
			expect(helper.gethtml(html)).toContain('ts-table-rows');
			done();
		});
	});

	it('should contain gutter', function(done) {
		var html = '<div data-ts="Table" id="mytable"></div>';
		var spirit = getspirit(html, 'mytable');
		spirit.selectable().rows([{ cells: ['A', 'D', 'G'], selected: true}]);
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-table-gutter');
			done();
		});
	});

	it('should contain foot', function(done) {
		// Dont konw why, we can't use the same id, or it will show some null error
		var html = '<div data-ts="Table" id="mytable1"></div>';
		var spirit = getspirit(html, 'mytable1');
		spirit.configurable();
		sometime(function later() {
			expect(spirit.element.innerHTML).toContain('ts-table-foot');
			done();
		});
	});
});
