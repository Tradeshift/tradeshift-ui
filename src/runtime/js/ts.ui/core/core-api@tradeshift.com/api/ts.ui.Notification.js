/**
 * API.
 */
ts.ui.Notification = {
	/**
	 * Identification.
	 * @returns {string}
	 */
	toString: function() {
		return 'ts.ui.Notification';
	},

	/**
	 * Display info.
	 * @param {string} text
	 * @returns {ts.ui.DialogModel}
	 */
	info: function(text) {},

	/**
	 * Display happy news. This is a non-blocking dialog.
	 * @param {string} text
	 * @returns {ts.ui.DialogModel}
	 */
	success: function(text) {},

	/**
	 * Display warning.
	 * @param {string} text
	 * @returns {ts.ui.DialogModel}
	 */
	warning: function(text) {},

	/**
	 * Display error.
	 * @param {string} text
	 * @returns {ts.ui.DialogModel}
	 */
	error: function(text) {}
};

// Implementation ..............................................................

/**
 * The Notification is basically a facade for a Dialog.
 * @using {ts.ui.Dialog} Dialog
 * @using {gui.Object} GuiObject
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} confirmed
 */
(function using(Dialog, GuiObject, chained, confirmed) {
	/**
	 * Validate argument types.
	 * @param {function} action
	 */
	function confirm(action) {
		return confirmed('string', '(string|object)', '(object)')(action);
	}

	/**
	 * Get dialog for type.
	 * @param {string} type
	 * @param {Arguments} args
	 */
	function getdialog(type, args) {
		return Dialog.$getdialog(type, args, true);
	}

	GuiObject.extend(ts.ui.Notification, {
		/**
		 * Arguments order here is *fuzzy*: One string will specify the message,
		 * another potential string will specify the button text and an object
		 * will configure the dialog `onaccept` callback and some other stuff.
		 * @param {string} text
		 * @param @optional {object} config
		 * @returns {ts.ui.Notification}
		 */
		success: confirm(function(/* ...args */) {
			return getdialog(Dialog.SUCCESS, arguments);
		}),

		/**
		 * @param {string} text
		 * @param @optional {string} label
		 * @param @optional {object} config
		 * @returns {ts.ui.Notification}
		 */
		info: confirm(function(/* ...args */) {
			return getdialog(Dialog.INFO, arguments);
		}),

		/**
		 * @param {string} text
		 * @param @optional {string} label
		 * @param @optional {object} config
		 * @returns {ts.ui.Notification}
		 */
		warning: confirm(function(/* ...args */) {
			return getdialog(Dialog.WARNING, arguments);
		}),

		/**
		 * @param {string} text
		 * @param @optional {string} label
		 * @param @optional {object} config
		 * @returns {ts.ui.Notification}
		 */
		error: confirm(function(/* ...args */) {
			return getdialog(Dialog.ERROR, arguments);
		})
	});
})(ts.ui.Dialog, gui.Object, gui.Combo.chained, gui.Arguments.confirmed);
