/**
 * Sync module.
 */
gui.module('edb-sync@wunderbyte.com', {
	oncontextinitialize: function() {
		/**
		 * Create synchronized instance of Type from source.
		 * @param {edb.Type} type
		 * @param {edb.Type|String} source
		 * @param {number} ways
		 * @param @optional {boolean} global
		 * @returns {edb.Type}
		 */
		function sync(Type, source, ways, global) {
			return edb.Synchronizer.sync(Type.from(source), ways, global);
		}

		/**
		 * Hello.
		 */
		edb.Type.mixin(
			{
				// Instance properties ....................................

				/**
				 *
				 */
				$synchronizity: edb.SyncTransmitter.$NONE,

				/**
				 *
				 */
				$synchglobally: false
			},
			{
				// Recurring static ...................................................

				/**
				 * Create out-synchronized instance from source.
				 * @param {edb.Type|String} source
				 * @returns {edb.Type}
				 */
				syncAs: function(source) {
					return sync(this, source, edb.Synchronizer.$SYNC_AS);
				},

				/**
				 * Create in-synchronized instance from source.
				 * @param {edb.Type|String} source
				 * @returns {edb.Type}
				 */
				syncTo: function(source) {
					return sync(this, source, edb.Synchronizer.$SYNC_TO);
				},

				/**
				 * Create synchronized instance from source.
				 * @param {edb.Type|String} source
				 * @returns {edb.Type}
				 */
				sync: function(source) {
					return sync(this, source, edb.Synchronizer.$SYNC);
				},

				/**
				 * Create global out-synchronized instance from source.
				 * @param {edb.Type|String} source
				 * @returns {edb.Type}
				 */
				syncGlobalAs: function(source) {
					return sync(this, source, edb.Synchronizer.$SYNC_AS, true);
				},

				/**
				 * Create global in-synchronized instance from source.
				 * @param {edb.Type|String} source
				 * @returns {edb.Type}
				 */
				syncGlobalTo: function(source) {
					return sync(this, source, edb.Synchronizer.$SYNC_TO, true);
				},

				/**
				 * Create global synchronized instance from source.
				 * @param {edb.Type|String} source
				 * @returns {edb.Type}
				 */
				syncGlobal: function(source) {
					return sync(this, source, edb.Synchronizer.$SYNC, true);
				}
			}
		);
	}
});
