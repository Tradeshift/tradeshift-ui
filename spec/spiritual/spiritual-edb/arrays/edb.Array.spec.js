/**
 * Array methods.
 */
describe('edb.Array', function likethis() {
	function Observer() {}
	Observer.prototype = {
		poked: 0,
		onchange: function(changes) {
			this.poked = this.poked + 1;
		}
	};

	it('should push', function() {
		var list = new edb.Array([null]);
		expect(list.push(true, false)).toBe(3);
		expect(list.length).toBe(3);
	});

	it('should pop', function() {
		var list = new edb.Array([null]);
		expect(list.pop()).toBe(null);
		expect(list.length).toBe(0);
	});

	it('should shift', function() {
		var list = new edb.Array([null]);
		expect(list.shift()).toBe(null);
		expect(list.length).toBe(0);
	});

	it('should unshift', function() {
		var list = new edb.Array([null]);
		expect(list.unshift(true, false)).toBe(3);
		expect(list.length).toBe(3);
	});

	it('should splice', function() {
		var list = new edb.Array([null]);
		expect(list.splice(0, 1, true)[0]).toBe(null);
		expect(list.length).toBe(1);
	});

	it('should reverse', function() {
		var list = new edb.Array([true, false]);
		list.reverse();
		expect(list[0]).toBe(false);
	});
});
