describe('ts.ui.TextAreaSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<textarea data-ts="TextArea"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('textarea'));
			expect(spirit.constructor).toBe(ts.ui.TextAreaSpirit);
			done();
		});
	});

	/*
	 * TODO: REACTIVATE WHEN NUMBER AND OTHERS ARE FIXED
	it('must fail when not channeled to an INPUT or TEXTAREA', function() {
		var dom = helper.createTestDom();
		var div = document.createElement('div');
		var err = null;
		try {
			div.setAttribute('ts-textarea', 'ts-textarea');
			dom.appendChild(div);
		} catch(exception) {
			err = exception;
		}
		expect(err).not.toBeNull();
	});
	*/
});
