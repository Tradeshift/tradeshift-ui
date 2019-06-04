/**
 * Central security service.
 * @using {HTMLDivElement} safeelm
 * @using {Map<string,string>} safemap
 * @using {String} safedecode
 * @using {RegExp} unsafexp
 */
edbml.Security = (function using(safeelm, safemap, safedecode, unsafexp) {
	return {
		/**
		 * Escape potentially unsafe string for use in HTML element context.
		 * @param {string} string
		 * @returns {string}
		 */
		$safetext: function(string) {
			safeelm.firstChild.data = String(string);
			return safedecode(safeelm.innerHTML);
		},

		/**
		 * Escape potentially unsafe string for use in HTML attribute context.
		 * TODO(jmo@): This is UNSAFE. We should look into more security stuff.
		 * @see https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.232_-_Attribute_Escape_Before_Inserting_Untrusted_Data_into_HTML_Common_Attributes
		 * @param {string} string
		 * @returns {string}
		 */
		$safeattr: function(string) {
			return String(string).replace(unsafexp, function(c) {
				return safemap[c];
			});
		}
	};
})(
	// Using ....................................................................

	/*
	 * Creates an element for escaping
	 * text that goes into HTML markup.
	 */
	(function safeelm() {
		var div = document.createElement('div');
		var txt = document.createTextNode('');
		div.appendChild(txt);
		return div;
	})(),
	/*
	 * Creates a basic (UNSAFE) map for escaping
	 * text that goes into HTML attribute context.
	 * We'll need to figure out something better...
	 */
	(function safemap() {
		return {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		};
	})(),
	/*
	 * Replace safe characters in innerHTML
	 * Only & is a safe character right now
	 * May be we need more later, depends on
	 * the requirment of the user
	 */
	function safedecode(string) {
		if (!string) {
			return string;
		}
		return string.replace(/&amp;/g, '&');
	},
	/*
	 * (UNSAFE) regular expression to figure out some basic
	 * entities that should be escaped in HTML attributes.
	 */
	/[&<>'"]/g
);
