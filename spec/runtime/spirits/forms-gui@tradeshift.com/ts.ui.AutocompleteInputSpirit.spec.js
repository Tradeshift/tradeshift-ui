describe('ts.ui.AutocompleteInputSpirit', function likethis() {
	var MARKUP = '<input data-ts="AutoComplete" id="myautocomplete" />';
	var dom;

	beforeEach(function dothis() {
		dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
	});

	it('should (eventually) channel via ts-attribute', function(done) {
		sometime(function later() {
			var spirit = ts.ui.get(dom.querySelector('input'));
			expect(spirit.constructor).toBe(ts.ui.AutocompleteInputSpirit);
			done();
		});
	});

	it('should insert the AutocompleteDropdownSpirit (results dropdown)', function(done) {
		sometime(function later() {
			var fake = ts.ui.get(dom.querySelector('input + div'));
			expect(fake.constructor).toBe(ts.ui.AutocompleteDropdownSpirit);
			done();
		});
	});

	describe('ts.ui.AutocompleteDropdownSpirit', function likethis() {
		var DATA = [
			{ key: 0, value: 'zero' },
			{ key: 1, value: 'one' },
			{ key: 2, value: 'two' }
		];

		beforeEach(function dothis(done) {
			sometime(function later() {
				var autocomplete = ts.ui.get(dom.querySelector('#myautocomplete'));
				autocomplete.data(DATA);
				// Without an onfilter, the dropdown filters to an empty list and
				// nothing renders — so match every item while the field is empty.
				autocomplete.onfilter(function(value) {
					return DATA.filter(function(item) {
						return item.value.indexOf(value) > -1;
					});
				});
				done();
			});
		});

		it('should open the results when the field has focus', function(done) {
			dom.querySelector('#myautocomplete').focus();
			sometime(function later() {
				var resultsList = dom.querySelector('.ts-autocomplete-list');
				expect(resultsList).not.toBeNull();
				expect(resultsList.childElementCount > 0).toBe(true);
				done();
			});
		});

		it('should show the number of matches', function(done) {
			dom.querySelector('#myautocomplete').focus();
			sometime(function later() {
				var resultsItem = dom.querySelector('.ts-autocomplete-list .ts-autocomplete-results');
				expect(resultsItem.innerHTML).toBe('3 matches');
				done();
			});
		});
	});
});
