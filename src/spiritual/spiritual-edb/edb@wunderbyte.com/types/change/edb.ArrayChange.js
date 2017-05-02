/**
 * @see http://wiki.ecmascript.org/doku.php?id=harmony:observe#array.observe
 * @param {edb.Array} array
 */
edb.ArrayChange = function(array, index, removed, added) {
	this.type = edb.ArrayChange.TYPE_SPLICE; // hardcoded for now
	this.object = array;
	this.index = index;
	this.removed = removed || [];
	this.added = added || [];
};

edb.ArrayChange.prototype = gui.Object.create(edb.Change.prototype, {
	/**
	 * Index of change.
	 * @type {}
	 */
	index: -1,

	/**
	 * List removed members.
	 * TODO: What should happen to them?
	 * @type {Array}
	 */
	removed: null,

	/**
	 * List added members.
	 * @type {Array}
	 */
	added: null
});

/*
 * Update types. We'll stick to `splice` for now.
 */
edb.ArrayChange.TYPE_SPLICE = 'splice';

/**
 * Given a `splice` change, compute the arguments required
 * to cause or reproduce the change using `array.splice()`.
 * @see http://mdn.io/splice
 */
edb.ArrayChange.toSpliceParams = function(change) {
	if (change.type === edb.ArrayChange.TYPE_SPLICE) {
		var idx = change.index;
		var out = change.removed.length;
		var add = change.added;
		return [idx, out].concat(add);
	} else {
		throw new TypeError();
	}
};
