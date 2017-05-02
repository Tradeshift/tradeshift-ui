/**
 *
 * @param {edb.ArrayChange} change
 * @param {String} instanceid
 */
edb.ArraySync = function(change, instanceid) {
	var array = change.object;
	this.$synchronizity = array.$synchronizity;
	this.$synchglobally = array.$synchglobally;
	this.type = edb.ArrayChange.TYPE_SPLICE;
	change.added = change.added.map(function(thing) {
		return edb.Type.is(thing) ? JSON.parse(thing.serializeToString()) : thing;
	});
	this.args = edb.ArrayChange.toSpliceParams(change);
	this.$instanceid = instanceid;
};

edb.ArraySync.prototype = {
	type: null,
	args: null,
	$instanceid: null
};
