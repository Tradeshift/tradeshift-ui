describe('ts.ui.TagSpirit', function likethis() {
	// The Tag must be channeled into a FIGURE element (see the spirit's
	// onconfigure, which throws otherwise).
	var MARKUP = '<figure data-ts="Tag"></figure>';

	function setup(action) {
		var dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			action(ts.ui.get(dom.querySelector('figure')));
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(ts.ui.TagSpirit.is(spirit)).toBe(true);
			done();
		});
	});

	// Setting `deletable` flips the model, which the spirit turns into the
	// `ts-tag-deletable` classname in `_update` — observable on the element.
	it('should get the deletable classname when made deletable', function(done) {
		setup(function(spirit) {
			spirit.deletable = true;
			sometime(function updated() {
				expect(spirit.element.className).toContain('ts-tag-deletable');
				done();
			});
		});
	});

	// Same story for `clickable` → `ts-tag-clickable`.
	it('should get the clickable classname when made clickable', function(done) {
		setup(function(spirit) {
			spirit.clickable = true;
			sometime(function updated() {
				expect(spirit.element.className).toContain('ts-tag-clickable');
				done();
			});
		});
	});

	// Same story for `locked` → `ts-tag-locked`.
	it('should get the locked classname when locked', function(done) {
		setup(function(spirit) {
			spirit.locked = true;
			sometime(function updated() {
				expect(spirit.element.className).toContain('ts-tag-locked');
				done();
			});
		});
	});

	// A string passed as `data` becomes the tag's rendered content.
	it('should render its data as text', function(done) {
		setup(function(spirit) {
			spirit.data = 'Copenhagen';
			sometime(function rendered() {
				expect(spirit.element.innerHTML).toContain('Copenhagen');
				done();
			});
		});
	});
});
