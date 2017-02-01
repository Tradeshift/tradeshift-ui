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

	/**
	 * @TODO finish these tests
	 */

	// describe('> ts.ui.AutocompleteDropdownSpirit', function likethis() {
	// 	beforeEach(function dothis(done) {
	// 		sometime(function later() {
	// 			var autocomplete = ts.ui.get('#myautocomplete');
	// 			autocomplete.data([
	// 				{
	// 					key: 0,
	// 					value: 'zero'
	// 				},
	// 				{
	// 					key: 1,
	// 					value: 'one'
	// 				},
	// 				{
	// 					key: 2,
	// 					value: 'two'
	// 				}
	// 			]);
	// 			done();
	// 		});
	// 	});
	//
	//
	// 	it('should open the results when the field has focus', function(done) {
	// 		console.log('should open the results when the field has focus');
	// 		sometime(function later() {
	// 			console.log('focusing');
	// 			dom.querySelector('#myautocomplete').focus();
	// 			sometime(function later() {
	// 				var resultsList = dom.querySelector('.ts-autocomplete-list');
	// 				expect(resultsList).not.toBeNull();
	// 				expect(resultsList.childElementCount > 0).toBeTruthy();
	// 				done();
	// 			});
	// 		});
	// 	});
	//
	// 	it('should have the results item on top', function(done) {
	// 		console.log('should have the results item on top');
	// 		dom.querySelector('#myautocomplete').focus();
	// 		sometime(function later() {
	// 			var resultsItem =
	// 				dom.querySelector('.ts-autocomplete-list .ts-autocomplete-results');
	// 			expect(resultsItem.innerHTML).toBe('3 matches');
	// 			done();
	// 		});
	// 	});
	// });
});
