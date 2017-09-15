describe('ts.ui.ButtonSpirit', function likethis() {
	var MARKUP = ['<button data-ts="Button">', '	<span>Label</span>', '</buttton>'].join('\n');

	function setup(action, html) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = html || MARKUP;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('button'));
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.ButtonSpirit);
			done();
		});
	});

	it('should default to type="button"', function(done) {
		setup(function(spirit) {
			expect(spirit.element.type).toBe('button');
			done();
		});
	});

	it('... really should, but not if "submit" is specified', function(done) {
		var html = MARKUP.replace('data-ts="Button"', 'data-ts="Button" type="submit"');
		setup(function(spirit) {
			expect(spirit.element.type).toBe('submit');
			done();
		}, html);
	});

	it('should contain ts-loading-message', function(done) {
		var html = '<button data-ts="Button" busy="leo"><span>Label</span></buttton>';
		setup(function(spirit) {
			expect(spirit.element.innerHTML).toContain('ts-loading-message');
			done();
		}, html);
	});
});
