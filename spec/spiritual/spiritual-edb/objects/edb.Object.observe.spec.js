/**
 * Observing objects.
 */
describe('edb.Object.observe()', function likethis() {
	function Observer() {}
	Observer.prototype = {
		poked: 0,
		onchange: function(changes) {
			this.poked = this.poked + 1;
		}
	};

	it('should trigger on property change', function(done) {
		var john = new Observer();
		var hans = new edb.Object({
			name: 'Hans'
		});
		hans.addObserver(john);
		hans.name = 'Jens';
		setTimeout(function() {
			expect(john.poked).toBe(1);
			hans.removeObserver(john);
			done();
		}, 25); // Firefox 40 now needs more time in the timeout, strangely :/
	});

	it('should only trigger ONCE when multiple changes are done', function(done) {
		var john = new Observer();
		var hans = new edb.Object({
			name: 'Hans',
			nickname: 'Hanzi',
			age: 23
		});
		hans.addObserver(john);
		hans.name = 'Jens';
		hans.nickname = 'Jones';
		hans.age = 46;
		setTimeout(function() {
			expect(john.poked).toBe(1);
			hans.removeObserver(john);
			done();
		}, 25);
	});

	it('should report what the changes are, of course', function(done) {
		var john = new Observer();
		var hans = new edb.Object({
			name: 'Hans',
			nickname: 'Hanzi',
			age: 23
		});
		hans.addObserver(john);
		hans.name = 'Jens';
		hans.nickname = 'Jones';
		hans.age = 46;
		// expect(changes).toEqual({ object: 'with', all: ['the', 'properties'] })
		john.onchange = function(changes) {
			var type = edb.ObjectChange.TYPE_UPDATE;
			expect(changes).toEqual([
				{
					object: hans,
					name: 'name',
					newValue: 'Jens',
					oldValue: 'Hans',
					type: type
				},
				{
					object: hans,
					name: 'nickname',
					newValue: 'Jones',
					oldValue: 'Hanzi',
					type: type
				},
				{ object: hans, name: 'age', newValue: 46, oldValue: 23, type: type }
			]);
			done();
		};
	});
});
