/**
 * Observing arrays.
 */
describe('edb.Array.observe()', function likethis() {
	it('should trigger on push', function(done) {
		var list = new edb.Array([null]);
		list.addObserver({
			onchange: function() {
				expect(true).toBe(true);
				done();
			}
		});
		list.push(null);
	});

	it('should trigger on pop', function(done) {
		var list = new edb.Array([null]);
		list.addObserver({
			onchange: function() {
				expect(true).toBe(true);
				done();
			}
		});
		list.pop();
	});

	it('should trigger on shift', function(done) {
		var list = new edb.Array([null]);
		list.addObserver({
			onchange: function() {
				expect(true).toBe(true);
				done();
			}
		});
		list.shift();
	});

	it('should trigger on unshift', function(done) {
		var list = new edb.Array([null]);
		list.addObserver({
			onchange: function() {
				expect(true).toBe(true);
				done();
			}
		});
		list.unshift(null);
	});

	it('should trigger on splice', function(done) {
		var list = new edb.Array([null]);
		list.addObserver({
			onchange: function() {
				expect(true).toBe(true);
				done();
			}
		});
		list.splice(1, 0, null);
	});

	it('should trigger on reverse', function(done) {
		var list = new edb.Array([null]);
		list.addObserver({
			onchange: function() {
				expect(true).toBe(true);
				done();
			}
		});
		list.reverse();
	});

	it('should only trigger once', function(done) {
		var list = new edb.Array([null]);
		list.addObserver({
			onchange: function() {
				expect(true).toBe(true);
				done();
			}
		});
		list.push(null);
		list.pop();
		list.unshift(null);
		list.shift();
		list.splice(1, 0, null);
		list.reverse();
	});
});
