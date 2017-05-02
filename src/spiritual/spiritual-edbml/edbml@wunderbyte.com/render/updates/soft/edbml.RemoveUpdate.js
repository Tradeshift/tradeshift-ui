/**
 * Remove.
 * @extends {edbml.SoftUpdate}
 */
edbml.RemoveUpdate = edbml.SoftUpdate.extend({
	/**
	 * Update type.
	 * @type {String}
	 */
	type: edbml.Update.TYPE_REMOVE,

	/**
	 * Setup update.
	 * @param {String} id
	 */
	onconstruct: function(id) {
		this.id = id;
	},

	/**
	 * Execute update.
	 */
	update: function() {
		this.element(function(element) {
			var parent = element.parentNode;
			if (this._beforeUpdate(element)) {
				parent.removeChild(element);
				this._afterUpdate(parent);
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
		var message = 'edbml.RemoveUpdate #' + this.id;
		this.super._report(message);
	}
});
