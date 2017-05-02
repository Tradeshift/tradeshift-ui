/**
 * Synchronization studio.
 * @using {gui.Arguments#confirmed}
 */
edb.SyncTransmitter = (function using(confirmed) {
	/**
	 * Relay all changes from monitored source to
	 * synchronized targets via broadcast message.
	 * @param {Array<edb.Change>} changes
	 */
	function onchange(changes) {
		var dispatch = {};
		var syncdone = [];
		changes.forEach(function(c) {
			maybechange(c, c.object, dispatch, syncdone);
		});
		gui.Object.each(dispatch, function(id, syncs) {
			var method = edb.Synchronizer.globals[id] ? 'dispatchGlobal' : 'dispatch';
			gui.Broadcast[method](edb.SyncTransmitter.BROADCAST + id, syncs);
		});
		syncdone.forEach(function(type) {
			delete type.$willsync;
		});
	}

	/**
	 * @param {gui.Change} change
	 * @param {edb.Type} type
	 * @param {Map} dispatch
	 * @param {Array} syncdone
	 */
	function maybechange(change, type, dispatch, syncdone) {
		var sourceid = type.$instanceid;
		var targetid = type.$originalid || sourceid;
		if (type.$willsync) {
			syncdone.push(type);
		} else {
			setupsync(change);
			var changes = (dispatch[targetid] = dispatch[targetid] || []);
			changes.push(getchange(change, sourceid));
		}
	}

	/**
	 * @param {edb.Change} change
	 * @param {String} sourceid
	 * @returns {edb.ObjectSync|edb.ArraySync}
	 */
	function getchange(change, sourceid) {
		switch (change.type) {
			case edb.ObjectChange.TYPE_UPDATE:
				return new edb.ObjectSync(change, sourceid);
			case edb.ArrayChange.TYPE_SPLICE:
				return new edb.ArraySync(change, sourceid);
		}
	}

	/**
	 * Setup sync for newly introduced types.
	 * @param {edb.Change} change
	 */
	function setupsync(change) {
		function maybesync(thing) {
			if (edb.Type.is(thing)) {
				edb.Synchronizer.sync(thing, change.object.$synchronizity, change.object.$synchglobally);
			}
		}
		switch (change.type) {
			case edb.ObjectChange.TYPE_UPDATE:
				maybesync(change.newValue);
				break;
			case edb.ArrayChange.TYPE_SPLICE:
				change.added.forEach(maybesync);
				break;
		}
	}

	return {
		// Public ...........................................................

		/**
		 * Synchronization broadcast to be suffixed with `$instanceid`
		 * (more unique broadcasts implies less overhead in handlers).
		 * @type {String}
		 */
		BROADCAST: 'edb-synchronize-',

		/**
		 * Handle changes.
		 * @implements {IChangeHandler}
		 */
		onchange: function(changes) {
			onchange(changes);
		}
	};
})(gui.Arguments.confirmed);
