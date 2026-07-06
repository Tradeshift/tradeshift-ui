describe('ts.ui.HeaderBarSpirit', function likethis() {
	// HeaderBar isn't channeled via `data-ts`; it's summoned and possesses a
	// <header>, adding `ts-headerbar` in `onconfigure`. Every test asserts
	// rendered output, so it fails if the component stops doing its job (not
	// just if the model getter/setter changes).
	function setup(action) {
		var dom = helper.createTestDom();
		var spirit = ts.ui.HeaderBarSpirit.summon();
		spirit.dom.appendTo(dom);
		sometime(function later() {
			action(spirit);
		});
	}

	it('should summon a spirit that possesses a HEADER element', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.HeaderBarSpirit);
			expect(spirit.element.localName).toBe('header');
			expect(spirit.element.className).toContain('ts-headerbar');
			done();
		});
	});

	it('should render the title', function(done) {
		setup(function(spirit) {
			spirit.title('Test');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Test');
				done();
			});
		});
	});

	it('should render the tabs', function(done) {
		setup(function(spirit) {
			spirit.tabs([{ label: 'Purchases' }, { label: 'Sales' }]);
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Purchases');
				expect(spirit.element.innerHTML).toContain('Sales');
				done();
			});
		});
	});
});
