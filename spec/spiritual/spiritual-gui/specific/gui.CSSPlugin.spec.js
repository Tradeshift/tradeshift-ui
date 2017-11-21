/**
 * The CSSPlugin can do all sorts of things, but we'll stick to testing 
 * the "persistence" feature for now: `className` doesn't wipe our CSS.
 */
describe('gui.CSSPlugin', function likethis() {
	beforeEach(function() {
		this.sandbox = document.createElement('main');
		document.body.appendChild(this.sandbox);
	});

	afterEach(function() {
		this.sandbox.parentNode.removeChild(this.sandbox);
	});

	function hasclass(spirit, name) {
		return spirit.element.classList.contains(name);
	}

	it('should persist those classnames', function(done) {
		var spirit = gui.Spirit.summon();
		this.sandbox.appendChild(spirit.element);
		spirit.css.add('one two three');
		spirit.element.className = 'FOUR';
		sometime(function later() {
			['one', 'two', 'three', 'FOUR'].forEach(function(name) {
				expect(hasclass(spirit, name)).toBe(true);
			});
			spirit.css.remove('one two');
			spirit.element.className = 'ONE MILLION';
			sometime(function muchlater() {
				expect(hasclass(spirit, 'three')).toBe(true);
				['one', 'two'].forEach(function(name) {
					expect(hasclass(spirit, name)).toBe(false);
				});
				done();
			});
		});
	});
});
