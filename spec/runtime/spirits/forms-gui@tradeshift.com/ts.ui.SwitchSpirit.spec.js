describe('ts.ui.SwitchSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<select data-ts="Select"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('select'));
			expect(spirit.constructor).toBe(ts.ui.SelectSpirit);
			done();
		});
	});

	it('must fail when not channeled to an INPUT', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('data-ts', 'Switch');
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
			input.setAttribute('data-ts', 'Switch');
			input.type = 'text';
			dom.appendChild(input);
		} catch (exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});
});
