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

	function gettabsitem(spirit) {
		return spirit.element.querySelector('.ts-toolbar-menu.ts-left');
	}

	// Expectations ..............................................................

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.TabBarSpirit);
			done();
		});
	});

	it('should render the tabs', function(done) {
		setup(function(spirit) {
			spirit.tabs([{ label: 'Leo' }, { label: 'Daniel' }]);
			sometime(function later() {
				var item = gettabsitem(spirit);
				expect(item.innerHTML).toContain('Leo');
				expect(item.innerHTML).toContain('Daniel');
				done();
			});
		});
	});

	it('should collapse overflowing tabs into a "more" tab', function(done) {
		setup(function(spirit) {
			// Many long labels so the tabs can't fit the bar at any viewport,
			// forcing the responsive collapse. The overflow affordance is the
			// `.ts-tab-more` element, which the component shows (display:'') only
			// when tabs don't fit — so we poll for it rather than a fixed delay
			// (the collapse runs on layout, after render).
			var tabs = [];
			for (var i = 0; i < 20; i++) {
				tabs.push({ label: 'A rather long tab label number ' + i });
			}
			spirit.tabs(tabs);
			var deadline = Date.now() + 5000;
			(function poll() {
				var more = spirit.element.querySelector('.ts-tab-more');
				var shown = more && more.style.display !== 'none';
				if (shown || Date.now() >= deadline) {
					expect(more).not.toBeNull();
					if (more) {
						expect(more.style.display).not.toBe('none');
					}
					done();
				} else {
					setTimeout(poll, 50);
				}
			})();
		});
	});
});
