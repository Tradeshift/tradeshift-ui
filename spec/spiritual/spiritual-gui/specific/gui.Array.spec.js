/**
 * The config plugin matches prefixed DOM attributes
 * to property setters and method calls on the spirit.
 */
describe('gui.Array', function likethis() {
	// gui.Array.of
	it('should convert the method params to an array', function() {
		var array = gui.Array.of(1, 2, 3);
		expect(
			array.reduce(function(sum, n) {
				return sum + n;
			}, 0)
		).toBe(6);
	});

	// gui.Array.from
	it('should convert array like structure to a real array', function() {
		(function() {
			var array = gui.Array.from(arguments);
			expect(
				array.reduce(function(sum, n) {
					return sum + n;
				}, 0)
			).toBe(6);
		})(1, 2, 3);
	});

	// gui.Array.remove
	it('should remove two elements by index', function() {
		var array = [1, 2, 3, 4, 5];
		gui.Array.remove(array, 1, 2);
		expect(
			[1, 4, 5].every(function(n, i) {
				return array[i] === n;
			})
		).toBe(true);
	});

	// gui.Array.remove
	it('should remove one object member by reference', function() {
		var object = {};
		var array = [1, 2, object];
		gui.Array.remove(array, object);
		expect(array.length).toBe(2);
		expect(array.indexOf(object)).toBe(-1);
	});

	// gui.Array.remove
	it('should remove one string member by copy', function() {
		var array = [1, 2, 'test'];
		gui.Array.remove(array, 'test');
		expect(array.length).toBe(2);
		expect(array.indexOf('test')).toBe(-1);
	});

	// gui.Array.remove
	it('should remove from one reference up to another', function() {
		var array = [1, 2, 'start', 'nuke', 'nuke', 'stop', 3, 4];
		gui.Array.remove(array, 'start', 'stop');
		expect(
			[1, 2, 3, 4].every(function(n, i) {
				return array[i] === n;
			})
		).toBe(true);
	});
});
