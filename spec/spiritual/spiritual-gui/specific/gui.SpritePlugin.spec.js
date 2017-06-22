describe('gui.Sprite', function likethis() {
	// Preparations ..............................................................

	/**
	 * Before test.
	 */
	beforeEach(function() {
		this.sandbox = document.createElement('main');
		document.body.appendChild(this.sandbox);
	});

	/**
	 * After test.
	 */
	afterEach(function() {
		this.sandbox.parentNode.removeChild(this.sandbox);
	});

	/**
	 * Spirit of the test.
	 */
	var TestSpirit = gui.Spirit.extend({
		setSpriteStuff: function() {
			this.sprite.x = 10.01;
			this.sprite.y = 10.01;
			this.sprite.z = 10.01;
			this.sprite.xoffset = 10.01;
			this.sprite.yoffset = 10.01;
			this.sprite.zoffset = 10.01;
			this.sprite.scale = 10.01;
		}
	});

	// Expectations ..............................................................

	it('should set 3d transforms in cool browsers', function() {
		if (gui.Client.has3D) {
			var spirit = TestSpirit.summon();
			this.sandbox.appendChild(spirit.element);
			spirit.setSpriteStuff();
			var cssText = this.sandbox.children[0].style.cssText;
			expect(cssText.indexOf('transform-origin: 10px 10px 10px;')).toBeGreaterThan(-1);
			expect(
				cssText.indexOf('transform: translate3d(10px, 10px, 10px) scale(10.01);')
			).toBeGreaterThan(-1);
		} else {
			expect("this browser can't test this feature").toBeTruthy();
		}
	});

	it('should set 2d transforms and top+left in not so cool browsers', function() {
		if (!gui.Client.has3D) {
			var spirit = TestSpirit.summon();
			this.sandbox.appendChild(spirit.element);
			spirit.setSpriteStuff();
			var cssText = this.sandbox.children[0].style.cssText;
			expect(cssText.indexOf('left: 20px;')).toBeGreaterThan(-1);
			expect(cssText.indexOf('top: 20px;')).toBeGreaterThan(-1);
			expect(cssText.indexOf('-ms-transform-origin: 10px 10px;')).toBeGreaterThan(-1);
			expect(cssText.indexOf('-ms-transform: scale(10.01);')).toBeGreaterThan(-1);
		} else {
			expect("this browser shouldn't test this feature").toBeTruthy();
		}
	});
});
