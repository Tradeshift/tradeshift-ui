/**
 * Hardcoded string bundle.
 * TODO: What to do with strings?
 * TODO: At least localize strings!
 */
ts.ui.String = {
	/*
	 * Buttons and what not.
	 */
	LABEL_SUBMIT: 'Proceed',
	LABEL_ACCEPT: 'OK',
	LABEL_CANCEL: 'Cancel',
	LABEL_HELP: 'Help',
	LABEL_INFO: 'Read More',
	LABEL_OPTIONS: 'Options',
	LABEL_DATEPICK: 'Select Date',

	/**
	 * notifications.
	 */
	OFFLINE_NOTIFICATION: 'You are offline. Please contact your internet.',
	OFFLINE_TRYRELOADING: 'Try again',
	BAD_SERVICE_NOTIFICATION: 'An unfortunate error has occured',
	BAD_SERVICE_TRYRELOADING: 'Try again',

	/*
	 * Input field validation
	 */
	ERROR_PATTERNMISMATCH: 'The value does not match the specified pattern',
	ERROR_RANGEOVERFLOW: 'Too much',
	ERROR_RANGEUNDERFLOW: 'Not too much',
	ERROR_STEPMISTMATCH: 'Abnormal step',
	ERROR_TOOLONG: 'The value exceeds the specified maxlength',
	ERROR_TYPEMISMATCH: 'The value is not in the required syntax',
	ERROR_BADINPUT: "That's just plain wrong.",
	ERROR_VALUEMISSING: 'Please type something here',

	/**
	 * @depracated (although we should probably reintroduce Runtime validation!)
	 * Get error message for property name in {ts.ui.ValidationStateModel}.
	 * @param {string} error
	 * @returns {string}
	 */
	getError: function(error) {
		if ((error = this + ' ' + error.toUpperCase())) {
			return error;
		} else {
			console.error('No such error', error);
		}
	}
};
