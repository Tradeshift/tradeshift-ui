/**
 * Populate edb.Objects.
 */
describe('edb.ObjectPopulator', function likethis() {
	var NativeObject = Object;
	var NativeArray = Array;

	it('should automatically convert nested objects and arrays', function() {
		var hans = new edb.Object({
			name: 'Hans',
			bestfriend: {
				name: 'Ole'
			},
			otherfriends: [
				{ name: 'Arne' },
				{ name: 'John' },
				{ name: 'Benny B. Bakgear Børneorm A. Johansen' }
			]
		});
		expect(hans.bestfriend).toEqual(jasmine.any(edb.Object));
		expect(hans.otherfriends).toEqual(jasmine.any(edb.Array));
		expect(hans.otherfriends[0]).toEqual(jasmine.any(edb.Object));
	});

	it('should always preserve arrays as edb.Array instances', function() {
		var hans = new edb.Object({
			popularity: 23,
			friends: [
				{ name: 'Arne' },
				{ name: 'John' },
				{ name: 'Benny B. Bakgear Børneorm A. Johansen' }
			]
		});
		hans.popularity = 0;
		hans.friends = [];
		expect(hans.friends).toEqual(jasmine.any(edb.Array));
	});

	it('should support *simple* objects and arrays', function() {
		var hans = new edb.Object({
			simplefriend: Object,
			simplefriends: Array
		});
		hans.simplefriend = {};
		hans.simplefriends = [];
		expect(hans.simplefriend).toEqual(jasmine.any(NativeObject));
		expect(hans.simplefriends).toEqual(jasmine.any(NativeArray));
		expect(hans.simplefriend).not.toEqual(jasmine.any(edb.Object));
		expect(hans.simplefriends).not.toEqual(jasmine.any(edb.Array));
	});
});
