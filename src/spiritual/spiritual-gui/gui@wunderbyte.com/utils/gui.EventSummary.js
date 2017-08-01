/**
 * Provides convenient access to an events originating
 * window, document and spirit of the document element.
 * TODO: Fire this onmousemove only if has listeners!
 * @param {Event} e
 */
gui.EventSummary = function(e) {
	this._construct(e);
};

gui.EventSummary.prototype = {
	/**
	 * The event itself.
	 * @type {Event}
	 */
	event: null,

	/**
	 * Originating window.
	 * @type {Window}
	 */
	window: null,

	/**
	 * Originating document.
	 * @type {Document}
	 */
	document: null,

	/**
	 * Spirit of the root element (the HTML element) in originating document.
	 * @type {gui.DocumentSpirit}
	 */
	documentspirit: null,

	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object gui.EventSummary]';
	},

	// Private ...................................................................

	/**
	 * Breakdown event argument into more manegable properties
	 * (this method illustrates the need for en event summary).
	 * @param {Event} e
	 * @returns {object}
	 */
	_construct: function(e) {
		var win = null,
			doc = null,
			target = e.target,
			type = target.nodeType;
		if (gui.Type.isDefined(type)) {
			doc = type === Node.DOCUMENT_NODE ? target : target.ownerDocument;
			win = doc.defaultView;
		} else {
			win = target;
			doc = win.document;
		}
		this.event = e;
		this.window = win;
		this.document = doc;
		this.documentspirit = doc.documentElement.spirit;
	}
};
