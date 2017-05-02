/**
 * Collects HTML output during EDBML rendering phase.
 * Any methods added to this prototype will become
 * available in EDBML scripts as: out.mymethod()
 */
edbml.Out = function Out() {};

edbml.Out.prototype = {
	/**
	 * HTML string (not well-formed while parsing).
	 * @type {String}
	 */
	html: '',

	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object edbml.Out]';
	},

	/**
	 * Get HTML result (output override scenario).
	 * @returns {String}
	 */
	write: function() {
		return this.html;
	}
};
