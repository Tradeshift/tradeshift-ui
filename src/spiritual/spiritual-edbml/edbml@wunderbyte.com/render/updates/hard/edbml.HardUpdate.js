/**
 * Hey.
 * @using {gui.DOMPlugin} DOMPlugin
 */
edbml.HardUpdate = (function using(DOMPlugin) {
	return edbml.Update.extend({
		/**
		 * Update type.
		 * @type {String}
		 */
		type: edbml.Update.TYPE_HARD,

		/**
		 * XML element.
		 * @type {Element}
		 */
		xelement: null,

		/**
		 * Setup update.
		 * @param {String} id
		 * @param {Element} xelement
		 */
		onconstruct: function(id, xelement) {
			this.super.onconstruct();
			this.id = id;
			this.xelement = xelement;
		},

		/**
		 * Replace target subtree.
		 */
		update: function() {
			this.super.update();
			this.element(function(element) {
				if (this._beforeUpdate(element)) {
					gui.DOMPlugin.html(element, this.xelement.innerHTML);
					this._afterUpdate(element);
					this._report();
				}
			});
		},

		/**
		 * Clean up.
		 */
		dispose: function() {
			this.super.dispose();
			delete this.xelement;
		},

		// Private ...................................................................

		/**
		 * Hello.
		 */
		_report: function() {
			var message = 'edbml.HardUpdate #' + this.id;
			this.super._report(message);
		}
	});
})(gui.DOMPlugin);
