/**
 * The CSSPlugin can do all sorts of things, but we'll stick to testing
 * the "persistence" feature for now: `className` doesn't wipe our CSS.
 */
describe('gui.CSSPlugin', function likethis() {
	/**
	 * @param {gui.Spirit} spirit
	 * @param {string} name
	 * @returns {boolean}
	 */
	function hasclass(spirit, name) {
		return spirit.element.classList.contains(name);
	}

	/**
	 * @param {Function} setclass
	 * @param {Function} done
	 */
	function runtest(setclass, done) {
		var spirit = gui.Spirit.summon();
		spirit.dom.appendTo(document.body); // gui.DOMObserver needs this :/
		spirit.css.add('one two three');
		setclass(spirit.element, 'FOUR');
		sometime(function later() {
			['one', 'two', 'three', 'FOUR'].forEach(function(name) {
				expect(hasclass(spirit, name)).toBe(true);
			});
			spirit.css.remove('one two');
			setclass(spirit.element, 'ONE MILLION');
			sometime(function muchlater() {
				expect(hasclass(spirit, 'three')).toBe(true);
				['one', 'two'].forEach(function(name) {
					expect(hasclass(spirit, name)).toBe(false);
				});
				done();
			});
		});
	}

	it('should not mess with ordinary elements', function() {
		var div = document.createElement('div');
		div.className = 'johnson';
		expect(div.className).toBe('johnson');
		div.setAttribute('class', 'jurgenson');
		expect(div.getAttribute('class')).toBe('jurgenson');
	});

	it('should persist after `className`', function(done) {
		runtest(function setclass(elm, name) {
			elm.className = name;
		}, done);
	});

	it('should persist after `setAttribute`', function(done) {
		runtest(function setclass(elm, name) {
			elm.setAttribute('class', name);
		}, done);
	});
});
