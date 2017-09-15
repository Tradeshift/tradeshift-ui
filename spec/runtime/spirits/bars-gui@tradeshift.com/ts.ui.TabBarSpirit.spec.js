describe('ts.ui.TabBarSpirit', function likethis() {
	// Preparations ..............................................................

	function setup(action) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<div data-ts="TabBar"></div>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('div[data-ts=TabBar]'));
			action(spirit);
		});
	}

	// Expectations ..............................................................

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.TabBarSpirit);
			done();
		});
	});

	// SKETCHY TESTS ZONE ........................................................

	/*

	function gettabsitem(spirit) {
		return spirit.element.querySelector('.ts-toolbar-menu.ts-left');
	}

	// NOTE: this test may be subject to random failure

	it('should show some tabs', function(done) {
		var item;
		setup(function(spirit) {
			spirit.tabs([
				{
					label: 'Leo'
				},
				{
					label: 'Daniel'
				}
			]);
			sometime(function later() {
				item = gettabsitem(spirit);
				console.log('some tabs');
				expect(item.innerHTML).toContain('Leo');
				expect(item.innerHTML).toContain('Daniel');
				done();
			});
		});
	});

	it('should have more tabs', function(done) {
		var item;
		setup(function(spirit) {
			var tabs = [];
			for (var i = 0; i < 10; i++) {
				tabs.push({label: 'Moth' + i});
			}
			spirit.tabs(tabs);

			sometime(function later() {
				item = gettabsitem(spirit);
				expect(item.innerHTML).toContain('Moth');
				expect(item.innerHTML).toContain('More');
				done();
			});
		});
	});

	*/
});
