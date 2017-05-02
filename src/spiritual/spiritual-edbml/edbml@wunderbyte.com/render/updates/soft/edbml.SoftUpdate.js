/**
 * Soft update.
 * @extends {edbml.Update}
 */
edbml.SoftUpdate = edbml.Update.extend({
	/**
	 * XML element stuff (not used by edbml.RemoveUpdate).
	 * @type {Element}
	 */
	xelement: null,

	/**
	 * Update type defined by descendants.
	 * Matches insert|append|remove
	 * @type {String}
	 */
	type: null,

	/**
	 * Clean stuff up for what it's worth.
	 */
	dispose: function() {
		this.super.dispose();
		delete this.xelement;
	},

	// Private ...................................................................

	/**
	 * TODO: make static, argument xelement
	 * Convert XML element to HTML element. Method document.importNode can not
	 * be used in Firefox, it will kill stuff such as the document.forms object.
	 * TODO: Support namespaces and what not
	 * @param {HTMLElement} element
	 */
	_import: function(parent) {
		var temp = document.createElement(parent.nodeName);
		temp.innerHTML = this.xelement.outerHTML;
		return temp.firstChild;
	}
});
