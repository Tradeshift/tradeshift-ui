/**
 * @param {RegExp} PEEK - match expression to read variable declared in EDBML
 * @param {RegExp} POKE - match expression to execute function declared in EDBML
 */
(function scoped(PEEK, POKE) {
	/**
	 * Replace inline event listeners with CSP-safe attributes. These attributes 
	 * must later be converted to real event listeners by an external mechanism.
	 * TODO: Perhaps move this change into the dependency `grunt-spiritual-edbml`
	 * @param {string} html
	 * @returns {string}
	 */
	function contentSecured(html) {
		return html.replace(PEEK, '$1="$2"').replace(POKE, 'data-$1="$2"');
	}

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
			return contentSecured(this.html);
		}
	};
})(
	/(data-ts\.[_$a-z0-9]*)="edbml\.\$get\(\&quot;(key\d+)\&quot;\);"/g,
	/(on[a-z]*)="edbml\.\$run\(this, '(key\d*)'\);"/g
);
