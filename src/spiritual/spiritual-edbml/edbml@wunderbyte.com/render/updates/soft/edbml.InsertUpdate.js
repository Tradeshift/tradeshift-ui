/**
 * Insert.
 * @extends {edbml.SoftUpdate}
 */
edbml.InsertUpdate = edbml.SoftUpdate.extend({
	/**
	 * Update type.
	 * @type {String}
	 */
	type: edbml.Update.TYPE_INSERT,

	/**
	 * XML element.
	 * @type {Element}
	 */
	xelement: null,

	/**
	 * Setup update.
	 * @param {String} id Insert before this ID
	 * @param {Element} xelement
	 */
	onconstruct: function(id, xelement) {
		this.id = id;
		this.xelement = xelement;
	},

	/**
	 * Execute update.
	 */
	update: function() {
		var parent, child;
		this.element(function(sibling) {
			parent = sibling.parentNode;
			child = this._import(parent);
			if (this._beforeUpdate(parent)) {
				parent.insertBefore(child, sibling);
				this._afterUpdate(child);
				this._report();
			}
		});
	},

	// Private ...................................................................

	/**
	 * Report.
	 * TODO: Push to update manager.
	 */
	_report: function() {
		var message = 'edbml.InsertUpdate #' + this.xelement.getAttribute('id');
		this.super._report(message);
	}
});
