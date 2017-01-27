describe('ts.ui.AsideSpirit.edbml', function likethis() {
	function gethtml(model) {
		var spirit = ts.ui.AsideSpirit.summon(model);
		var dom = helper.createTestDom();
		dom.appendChild(spirit.element);
		return dom.innerHTML;
	}

	it('should contain header and panel', function(done) {
		var model = new ts.ui.AsideModel({
			title: 'leo'
		});

		sometime(function later() {
			expect(gethtml(model)).toContain('ts-toolbar');
			expect(gethtml(model)).toContain('ts-panel');
			done();
		});
	});

	it('should contain item render', function(done) {
		var model = new ts.ui.AsideModel({
			title: 'Should contain an item',
			items: [
				{
					item: 'text',
					text: 'daniel'
				}
			]
		});
		sometime(function later() {
			expect(gethtml(model)).toContain('daniel');
			done();
		});
	});
});
