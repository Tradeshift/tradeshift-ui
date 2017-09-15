describe('ts.ui.TextInputSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<input data-ts="Input"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.TextInputSpirit);
			done();
		});
	});

	/*
	 * TODO: REACTIVATE WHEN NUMBER INPUT IS FIXED
	it('should fail when not channeled to an INPUT or TEXTAREA', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('ts-input', 'ts-input');
			dom.appendChild(div);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});

	it('should fail when channeled to an INPUT of wrong type', function() {
		var dom = helper.createTestDom();
		var input = document.createElement('input');
		var err = null;
		try {
			input.setAttribute('ts-input', 'ts-input');
			input.type = 'checkbox';
			dom.appendChild(input);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});
	*/
});
