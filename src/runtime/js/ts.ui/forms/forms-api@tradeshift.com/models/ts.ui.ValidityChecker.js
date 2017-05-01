/**
 * We can't rely on native HTML5 validation in our browsers;
 * and also, we need model-only (DOM-free) validation support.
 * So we'll do it the hard way. When all the browsers have good
 * support, strategy here would be to createElement('input') with
 * specified attributes and perform `checkValidity` on that element.
 */
ts.ui.ValidityChecker = gui.Class.create(
	Object.prototype,
	{
		/**
		 * Check element validity and update validation state.
		 * TODO: Release the regexpert!
		 * @param {HTMLInputElement|ts.ui.InputModel} element
		 * @param {ts.ui.ValidityStateModel} state
		 * @returns {boolean}
		 */
		checkValidity: function(input, state) {
			state.valid = true;
			if (input.required) {
				if (input.value === '') {
					state.valid = false;
					state.valueMissing = true;
				}
			}
			switch (input.type) {
				case 'number':
					if (isNaN(input.value)) {
						state.valid = false;
						state.badInput = true;
					}
					break;
				case 'email':
					break;
				case 'url':
					break;
			}
			return state.valid;
		}
	},
	{
		// Static .................................................................

		/**
		 * @type {RegExp}
		 */
		EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$./
	}
);
