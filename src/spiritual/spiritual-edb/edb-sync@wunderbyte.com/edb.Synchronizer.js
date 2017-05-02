/**
 * Synchronization studio.
 */
edb.Synchronizer = (function() {
	/**
	 * Setup type for synchronization.
	 * @param {edb.Type} type
	 * @param {number} ways
	 * @param {boolean} global
	 */
	function sync(type, ways, global) {
		var id = type.$originalid || type.$instanceid;
		if (ways === 4 || ways === 1) {
			syncto(type, id, global);
		}
		if (ways === 4 || ways === 2) {
			syncas(type, id, global);
		}
		type.$synchronizity = ways;
		type.$synchglobally = global || false;
	}

	/**
	 * @param {edb.Type} type
	 * @param {string} id
	 * @param {boolean} global
	 */
	function syncto(type, id, global) {
		var broadcast = edb.SyncTransmitter.BROADCAST + id;
		var addscoped = global ? 'addGlobal' : 'add';
		gui.Broadcast[addscoped](broadcast, new edb.SyncReceiver(type));
	}

	/**
	 * @param {edb.Type} type
	 * @param {string} id
	 * @param {boolean} global
	 */
	function syncas(type, id, global) {
		type.addObserver(edb.SyncTransmitter);
		if (global) {
			edb.Synchronizer.globals[id] = true;
		}
	}

	return {
		// Public ...........................................................

		$NONE: 0,
		$SYNC_AS: 1,
		$SYNC_TO: 2,
		$SYNC: 4,

		/**
		 * Tracking globally synchronized $instanceids.
		 * @type {Map<string,boolean>}
		 */
		globals: Object.create(null),

		/**
		 * @param {edb.Type} type
		 * @param {number} ways
		 * @param {boolean} global
		 */
		sync: gui.Arguments.confirmed('object', 'number', '(boolean)')(function(type, ways, global) {
			new edb.Crawler().crawl(type, {
				ontype: function(t) {
					if (!t.$synchronizity) {
						sync(t, ways, global);
					}
				}
			});
			return type;
		})
	};
})();
