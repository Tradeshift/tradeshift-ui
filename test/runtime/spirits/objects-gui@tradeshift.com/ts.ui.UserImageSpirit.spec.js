describe('ts.ui.UserImageSpirit', function likethis() {

	function setup(action, html, done) {
		var spirit, dom = helper.createTestDom();
		dom.innerHTML = html;
		sometime(function later(){
			spirit = ts.ui.get(dom.querySelector('img[data-ts=UserImage]'));
			action(spirit, dom);
			done();
		});
	}

	it('should (eventually) channel via ts-attribute', function(done) {
		var html = '<img data-ts="UserImage" alt="Karl Benson"/>';
		setup(function(spirit, dom){
			sometime(function later() {
				expect(spirit.constructor).toBe(ts.ui.UserImageSpirit);
				expect(spirit.element.className).toContain('ts-userimage');
				done();
			});	
		}, html, done);
	});

	it('should have title', function(done) {
		var html = '<img data-ts="UserImage" alt="Karl Benson"/>';
		setup(function(spirit, dom){
			sometime(function later() {
				expect(spirit.element.getAttribute('title')).toBe('Karl Benson');
				done();
			});	
		}, html, done);
	});

});
