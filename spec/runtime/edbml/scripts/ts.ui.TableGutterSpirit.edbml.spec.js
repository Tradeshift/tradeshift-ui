describe('ts.ui.TableGutterSpirit.edbml', function likethis() {
	it('should contain input', function(done) {
		var html = '<div data-ts="Table"></div>';
		sometime(function later() {
			expect(helper.gethtml(html)).toContain('<table');
			expect(helper.gethtml(html)).toContain('<tbody>');
			done();
		});
	});
});
