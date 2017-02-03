describe('ts.ui.TableGutterSpirit.edbml', function likethis() {
	it('should contain input', function(done) {
		var dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="Table"></div>';
		sometime(function later() {
			expect(dom.innerHTML).toContain('<table');
			expect(dom.innerHTML).toContain('<tbody>');
			done();
		});
	});
});
