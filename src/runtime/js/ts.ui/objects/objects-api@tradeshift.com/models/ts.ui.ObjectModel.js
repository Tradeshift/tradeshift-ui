/**
 * Advanced object model.
 * @see {ts.ui.CompanyCardModel}
 * @extends {ts.ui.Model}
 * @using {gui.Arguments#confirmed} confirmed
 */
ts.ui.ObjectModel = (function using(confirmed) {
	return ts.ui.Model.extend({
		/**
		 * Typically a GUID from the database.
		 * @type {string}
		 */
		id: null,

		/**
		 * Friendly name.
		 * @type {String}
		 */
		item: 'object',

		/**
		 * True if the model is used as mockup for a "preloader" type of rendering.
		 * @type {boolean}
		 */
		mock: false,

		/**
		 * The `data` is declared as a simple object in case we need to embed UBL
		 * documents and what not. This means that changes to the date will not
		 * automatically trigger EDBML renderings (the data cannot be observed).
		 * @type {JSONObject}
		 */
		data: Object,

		/**
		 * Bounce model to HTML.
		 * @param @optional {boolean} contentonly Omit the root <div ts-companycard><div> ?
		 * @param @optional {string} classconfig The spirits classname may serve as config
		 * @returns {string}
		 */
		render: confirmed('(boolean)', '(string)')(function(contentonly, classconfig) {
			return this._edbml()(this, contentonly || false, classconfig || 'ts-default');
		}),

		/**
		 * We should probably insist on the ID.
		 * @param {object} json
		 */
		onconstruct: function() {
			this.super.onconstruct();
			if (!this.id) {
				throw new Error(this + ' requires a unique id');
			}
		},

		// Private .................................................................

		/**
		 * Get EDBML function for this object.
		 * Note: Subclass must implement this.
		 * @returns {function}
		 */
		_edbml: function() {
			console.error(this + ' needs an EDBML function');
		}
	});
})(gui.Arguments.confirmed);
