describe('ts.ui.SelectSpirit', function likethis() {
	var MARKUP = [
		'<select data-ts="Select">',
		'<option value="1">One</option>',
		'<option value="2">Two</option>',
		'<option value="3">Three</option>',
		'</select>'
	].join('\n');

	var MARKUP_MULTI = function(id, selectedArr) {
		return [
			'<div id="' + id + '">',
			'<select data-ts="Select" multiple>',
			'<option value="1" ' + (selectedArr[0] ? 'selected' : '') + '>One</option>',
			'<option value="2" ' + (selectedArr[1] ? 'selected' : '') + '>Two</option>',
			'<option value="3" ' + (selectedArr[2] ? 'selected' : '') + '>Three</option>',
			'</select>',
			'</div>'
		].join('\n');
	};

	it('should (eventually) channel via ts-attribute', function(done) {
		var spirit,
			dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			spirit = ts.ui.get(dom.querySelector('select'));
			expect(spirit.constructor).toBe(ts.ui.SelectSpirit);
			done();
		});
	});

	it('should insert the FakeSelectInputSpirit (fake select)', function(done) {
		var dom = helper.createTestDom();
		dom.innerHTML = MARKUP;
		sometime(function later() {
			var fake = ts.ui.get(dom.querySelector('select + input'));
			expect(fake.constructor).toBe(ts.ui.FakeSelectInputSpirit);
			done();
		});
	});

	it('should update the FakeSelectInputSpirit when programmatically modifying the selected options', function(done) {
		var dom = helper.createTestDom();
		/**
		 * To not have 500ms of timeout for each step in this test,
		 * we'll pre-populate three multiple selects.
		 */
		dom.innerHTML =
			MARKUP_MULTI('select-first', [false, false, false]) +
			MARKUP_MULTI('select-all', [false, false, false]) +
			MARKUP_MULTI('select-none', [true, true, true]);

		sometime(function later() {
			var selectFirstFake = dom.querySelector('#select-first input');
			var selectAllFake = dom.querySelector('#select-all input');
			var selectNoneFake = dom.querySelector('#select-none input');

			expect(selectFirstFake.value).toBe('0 selected');
			expect(selectAllFake.value).toBe('0 selected');
			expect(selectNoneFake.value).toBe('3 selected');

			/**
			 * Select the first <option />
			 */
			dom.querySelector('#select-first select option:first-child').selected = true;
			/**
			 * Select all <option />'s
			 */
			var optionsSelect = dom.querySelectorAll('#select-all select option');
			for (var i = 0; i < optionsSelect.length; i++) {
				optionsSelect[i].selected = true;
			}
			/**
			 * Unselect all <option />'s
			 */
			var optionsToUnselect = dom.querySelectorAll('#select-none select option');
			for (var j = 0; j < optionsToUnselect.length; j++) {
				optionsToUnselect[j].selected = false;
			}

			sometime(function later() {
				expect(selectFirstFake.value).toBe('1 selected');
				expect(selectAllFake.value).toBe('3 selected');
				expect(selectNoneFake.value).toBe('0 selected');

				done();
			});
		});
	});
});
