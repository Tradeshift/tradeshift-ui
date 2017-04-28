/**
 * Append.
 * @extends {edbml.SoftUpdate}
 */
edbml.AppendUpdate = edbml.SoftUpdate.extend({
	/**
	 * Update type.
	 * @type {String}
	 */
	type: edbml.Update.TYPE_APPEND,

	/**
	 * Setup update.
	 * @param {String} id
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
		this.element(function(parent) {
			var child = this._import(parent);
			if (this._beforeUpdate(parent)) {
				parent.appendChild(child);
				this._afterUpdate(child);
				this._report();
			}
		});
	},

	/**
	 * Report.
	 * TODO: Push to update manager.
	 */
	_report: function() {
		var message = 'edbml.AppendUpdate #' + this.xelement.getAttribute('id');
		this.super._report(message);
	}
});
