/**
 * Validity state model.
 * @extends {edb.Object}
 */
ts.ui.ValidityStateModel = edb.Object.extend({
	// Matching HTML specification: Do not rename (see custom stuff below) .......

	/**
	 * The element meets all constraint validations
	 * and is therefore considered to be valid.
	 * @type {boolean}
	 */
	valid: true,

	/**
	 * The element's custom validity message has been set to a non-empty
	 * string by calling the element's `setCustomValidity()` method.
	 * @type {boolean}
	 */
	customError: false,

	/**
	 * The value does not match the specified pattern.
	 * @type {boolean}
	 */
	patternMismatch: false,

	/**
	 * The value is greater than the maximum specified by the max attribute.
	 * @type {boolean}
	 */
	rangeOverflow: false,

	/**
	 * The value is less than the minimum specified by the min attribute.
	 */
	rangeUnderflow: false,

	/**
	 * The value does not fit the rules determined by the step attribute
	 * (that is, it's not evenly divisible by the step value).
	 */
	stepMismatch: false,

	/**
	 * The value exceeds the specified maxlength. Some browsers block
	 * input at `maxlength`, preventing this. Maybe we should do the same.
	 * @type {boolean}
	 */
	tooLong: false,

	/**
	 * The value is not in the required syntax (when type is email or url).
	 * @type {boolean}
	 */
	typeMismatch: false,

	/**
	 * That's just plain wrong.
	 * @type {boolean}
	 */
	badInput: false,

	/**
	 * The element has a required attribute, but no value.
	 * @type {boolean}
	 */
	valueMissing: false

	// Tradeshift custom stuff ...................................................

	/*
	 * Custom stuff goes here....
	 */
});
