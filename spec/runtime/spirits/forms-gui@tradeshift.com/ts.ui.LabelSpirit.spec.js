describe('ts.ui.LabelSpirit', function likethis() {
	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = '<input data-ts="Label"/>';
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.LabelSpirit);
			done();
		});
	});

	function setupWithInputAndIcon(iconClass, action) {
		var inputSpirit, labelSpirit;
		var dom = helper.createTestDom();
		dom.innerHTML =
			'<label data-ts="Label">' +
			'<span>Text</span>' +
			'<input data-ts="Input" type="text" data-ts.icon' +
			(iconClass ? '="' + iconClass + '"' : '') +
			' />' +
			'</label>';
		sometime(function later() {
			inputSpirit = ts.ui.get(dom.querySelector('input'));
			labelSpirit = ts.ui.get(dom.querySelector('label'));
			expect(inputSpirit.icon).toBe(iconClass);
			expect(labelSpirit.element.className).toContain('ts-customiconlabel');
			action(inputSpirit, labelSpirit, dom);
		});
	}

	it('can have a custom icon', function(done) {
		var iconClass = 'ts-icon-logout';
		var iconChar = ts.ui.ICONS[iconClass];
		setupWithInputAndIcon(iconClass, function(inputSpirit, labelSpirit) {
			expect(labelSpirit.element.getAttribute('data-ts-icon')).toBe(iconChar);
			done();
		});
	});

	it('can override a default icon with a custom icon', function(done) {
		setupWithInputAndIcon('', function(inputSpirit, labelSpirit) {
			expect(labelSpirit.element.hasAttribute('data-ts-icon')).toBeTruthy();
			done();
		});
	});
});
