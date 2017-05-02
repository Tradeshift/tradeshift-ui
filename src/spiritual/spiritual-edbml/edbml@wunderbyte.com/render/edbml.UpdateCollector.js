/**
 * We collect updates over-aggresively in an attempt to traverse
 * the DOM tree in one direction only. The fellow will helps us
 * reduce the collected updates to the minimum required subset.
 */
edbml.UpdateCollector = gui.Class.create(Object.prototype, {
	/**
	 * Setup.
	 */
	onconstruct: function() {
		this._updates = [];
		this._hardupdates = {};
	},

	/**
	 * Collect update candidate. All updates may not be evaluated, see below.
	 * @param {edbml.Update} update
	 * @param {Map<String,boolean>} ids Indexing ID of ancestor elements
	 * @returns {edbml.UpdateCollector}
	 */
	collect: function(update, ids) {
		this._updates.push(update);
		if (update.type === edbml.Update.TYPE_HARD) {
			this._hardupdates[update.id] = true;
		} else {
			update.ids = ids || {};
		}
		return this;
	},

	/**
	 * Will this element be hardupdated?
	 * @param {String} id Element ID
	 * @returns {boolean}
	 */
	hardupdates: function(id) {
		return !!this._hardupdates[id];
	},

	/**
	 * Apply action to all relevant updates. For example:
	 * An attribute update is not considered relevant if
	 * the parent is scheduled to perform a full replace
	 * of it's children.
	 * @param {function} action
	 */
	eachRelevant: function(action) {
		var hardupdates = this._hardupdates;
		this._updates
			.filter(function(update) {
				return (
					update.type === edbml.Update.TYPE_HARD ||
					Object.keys(update.ids).every(function(id) {
						return !hardupdates.hasOwnProperty(id);
					})
				);
			})
			.forEach(function(update) {
				action(update);
			});
	},

	/**
	 * TODO: At some point, figure out what exactly to do here.
	 */
	dispose: function() {
		this._hardupdates = null;
		this._updates = null;
	},

	// Private ...................................................................

	/**
	 * Collecting updates.
	 * @type {Array<edbml.Update>}
	 */
	_updates: null,

	/**
	 * Tracking hard-updated element IDs.
	 * @type {Set<String>}
	 */
	_hardupdates: null
});
