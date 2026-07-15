describe('ts.ui.FooterBarSpirit', function likethis() {
	// FooterBar isn't channeled via `data-ts`; it's summoned and possesses a
	// <footer>, adding `ts-footerbar` in `onconfigure`. Every test asserts
	// rendered output, so it fails if the component stops doing its job.
	// NOTE: the spirit warns of a render race when configured before
	// `gui.ready`, so these render assertions can be timing-sensitive.
	function setup(action) {
		var dom = helper.createTestDom();
		var spirit = ts.ui.FooterBarSpirit.summon();
		spirit.dom.appendTo(dom);
		sometime(function later() {
			action(spirit);
		});
	}

	it('should summon a spirit that possesses a FOOTER element', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.FooterBarSpirit);
			expect(spirit.element.localName).toBe('footer');
			expect(spirit.element.className).toContain('ts-footerbar');
			done();
		});
	});

	it('should render the status message', function(done) {
		setup(function(spirit) {
			spirit.status('Test');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Test');
				done();
			});
		});
	});

	it('should render the actions', function(done) {
		setup(function(spirit) {
			spirit.actions([{ label: 'Delete' }, { label: 'Save' }]);
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Delete');
				expect(spirit.element.innerHTML).toContain('Save');
				done();
			});
		});
	});

	it('should clear rendered content', function(done) {
		setup(function(spirit) {
			spirit.status('Test');
			sometime(function later() {
				expect(spirit.element.innerHTML).toContain('Test');
				spirit.clear();
				sometime(function later() {
					expect(spirit.element.innerHTML).not.toContain('Test');
					done();
				});
			});
		});
	});
});
