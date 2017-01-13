describe('ts.ui.TimeSpirit', function likethis() {
	function setup(action, html) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('time'));
			action(spirit);
		});
	}

	it('should (eventually) channel via ts-attribute', function() {
		setup(function(spirit) {
			expect(spirit.constructor).toBe(ts.ui.TimeSpirit);
		});
	});

	it('should display past time', function() {
		var html = '<time data-ts="Time" datetime="2015-11-04 03:59:33"></time>';
		setup(function(spirit) {
			spirit.show();
			expect(spirit.element.innerHTML).toContain('ago');
		}, html);
	});

	it('should display 2 hours ago', function() {
		var html = '<time data-ts="Time" datetime="2015-11-04 03:59:33" realtime="2015-11-04 03:59:35"></time>';
		setup(function(spirit) {
			spirit.show();
			expect(spirit.element.innerHTML).toContain('2 hours ago');
		}, html);
	});

	it('should display a day ago', function() {
		var html = '<time data-ts="Time" datetime="a day ago"></time>';
		setup(function(spirit) {
			spirit.show();
			expect(spirit.element.innerHTML).toContain('a day ago');
		}, html);
	});
});
