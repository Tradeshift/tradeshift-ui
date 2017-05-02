/**
 *
 * @param {edb.ObjectChange} change
 * @param {String} instanceid
 */
edb.ObjectSync = function(change, instanceid) {
	change = gui.Object.copy(change);
	change = edb.ObjectSync.experimental(change);
	change = edb.ObjectSync.filter(change);
	gui.Object.extend(this, change);
	this.$instanceid = instanceid;
};

edb.ObjectSync.prototype = {
	name: null,
	type: null,
	newValue: null,
	$instanceid: null
};

edb.ObjectSync.experimental = function(change) {
	var old = change.oldValue;
	var neu = change.newValue;
	if (edb.Type.is(old)) {
		change.$synchronizity = old.$synchronizity;
		change.$synchglobally = old.$synchglobally;
		change.newValue = JSON.parse(neu.serializeToString());
	}
	return change;
};

/**
 * Reduce the payload by removing `object` and `oldValue`.
 * @param {edb.ObjectChange} change
 * @returns {object}
 */
edb.ObjectSync.filter = function(change) {
	return gui.Object.map(change, function(key, value) {
		if (!key.match(/oldValue|object/)) {
			return value;
		}
	});
};
