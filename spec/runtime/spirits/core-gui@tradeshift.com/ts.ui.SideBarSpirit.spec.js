describe('ts.ui.SideBarSpirit', function likethis() {
	// Preparations ..............................................................

	function setup(action) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<aside data-ts="SideBar"><div data-ts="Panel"><p>Leo</p></div></aside>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('aside'));
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.SideBarSpirit);
			expect(spirit.element.innerHTML).toContain('Leo');
			done();
		});
	});

	it('should show a title via DOM attribute', function(done) {
		setup(function(spirit) {
			spirit.element.setAttribute('data-ts.title', 'Daniel');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Daniel');
				done();
			});
		});
	});

	it('should show a title via API call', function(done) {
		setup(function(spirit) {
			spirit.title('Daniel');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Daniel');
				done();
			});
		});
	});

	it('should show a spinner via DOM attribute', function(done) {
		setup(function(spirit) {
			spirit.element.setAttribute('data-ts.busy', 'Moth');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Moth');
				done();
			});
		});
	});

	it('should show a button in the header', function(done) {
		setup(function(spirit) {
			spirit.header().buttons.push({
				icon: 'ts-icon-leo'
			});
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('ts-icon-leo');
				done();
			});
		});
	});
});
