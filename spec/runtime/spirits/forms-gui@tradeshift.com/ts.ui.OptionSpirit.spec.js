describe('ts.ui.OptionSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<input type="checkbox" data-ts="Option">';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.OptionSpirit);
			done();
		});
	});

	it('must fail when not channeled to an INPUT', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('data-ts', 'Option');
			dom.appendChild(div);
		} catch (exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});

	it('should fail when channeled to an INPUT of wrong type', function() {
		var dom = helper.createTestDom();
		var input = document.createElement('input');
		var err = null;
		try {
			input.setAttribute('data-ts', 'Option');
			input.type = 'text';
			dom.appendChild(input);
		} catch (exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});
});
