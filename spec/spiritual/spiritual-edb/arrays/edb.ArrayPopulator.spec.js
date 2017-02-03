/**
 * Populate edb.Arrays.
 */
describe('edb.ArrayPopulator', function likethis() {
	var NAME = 'Jim Bob Johnson';

	var PersonModel = edb.Object.extend({
		name: NAME
	});

	var PersonCollection = edb.Array.extend({
		$of: PersonModel
	});

	it('should autoconvert constructor args', function() {
		var persons = new PersonCollection([{}, {}, {}]);
		expect(persons[0].name).toBe(NAME);
	});

	it('should autoconvert when modified', function() {
		var persons = new PersonCollection();
		persons.push({});
		expect(persons[0].name).toBe(NAME);
	});

	it('should fail on bad input', function() {
		var persons; // eslint-disable-line no-unused-vars
		var fail = false;
		try {
			persons = new PersonCollection([false]);
		} catch (typeerror) {
			fail = true;
		}
		expect(fail).toBe(true);
	});
});
