/**
 * Reports busy and done while optionally showing and
 * hiding the big transparent DIV that covers it all.
 * TODO (jmo@): isBusy(string) to check the status of stuff.
 * @param {gui.Arguments.confirmed} confirmed
 */
ts.ui.StatusPlugin = (function using(confirmed) {
	var BUSY1 = ts.ui.BROADCAST_GLOBAL_STATUS_BUSY;
	var DONE1 = ts.ui.BROADCAST_GLOBAL_STATUS_DONE;
	var BUSY2 = ts.ui.BROADCAST_GLOBAL_STATUS_BUSY_BLOCKING;
	var DONE2 = ts.ui.BROADCAST_GLOBAL_STATUS_DONE_BLOCKING;

	return ts.ui.Plugin.extend({

		/**
		 * Tracking busy things.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._bookmarks = {};
		},

		/**
		 * Release busy stuff when destructed.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			var exit = {};
			if (this.isBusy()) {
				exit[BUSY1] = DONE1;
				exit[BUSY2] = DONE2;
				Object.keys(this._bookmarks).forEach(function(key) {
					var cuts = key.split(this._SEPARATOR);
					this._done(exit[cuts[0]], cuts[1]);
				}, this);
			}
		},

		/**
		 * Is busy?
		 * @param @optional {string} doingwhat
		 * @type {boolean}
		 */
		isBusy: function(doingwhat) {
			if (arguments.length) {
				return Object.keys(this._bookmarks).some(function(activity) {
					return activity.includes(doingwhat);
				});
			} else {
				return Object.keys(this._bookmarks).length > 0;
			}
		},

		/**
		 * Report busy.
		 * @param {String} message
		 */
		busy: function(message) {
			this._busy(BUSY1, message);
		},

		/**
		 * Report done.
		 * @param {String} message
		 */
		done: function(message) {
			this._done(DONE1, message);
		},

		/**
		 * Block while busy.
		 * @param {String} message
		 */
		busyBlocking: function(message) {
			this._busy(BUSY2, message);
		},

		/**
		 * Unblock when done.
		 * @param {String} message
		 */
		doneBlocking: function(message) {
			this._done(DONE2, message);
		},

		// Private .................................................................

		/**
		 * Separates the broadcast from the message in a bookmark key.
		 * @type {string}
		 */
		_SEPARATOR: ':::',

		/**
		 * Tracking busy status.
		 * @type {Map<string,boolean>}
		 */
		_bookmarks: null,

		/**
		 * Non-anonymize the message.
		 * @param {String} message
		 * @return {String}
		 */
		_stamp: function(message) {
			return '[' + this.spirit.constructor.$classname + '] ' + message;
		},

		/**
		 * Go busy.
		 * @param {String} broadcast
		 * @param {String} message
		 */
		_busy: confirmed('string')(function(broadcast, message) {
			this._bookmarks[broadcast + this._SEPARATOR + message] = true;
			message = this._stamp(message);
			this.spirit.life.dispatch(ts.ui.LIFE_STATUS_BUSY, message);
			gui.Broadcast.dispatchGlobal(broadcast, message);
		}),

		/**
		 * Now done.
		 * @param {String} broadcast
		 * @param {String} message
		 */
		_done: confirmed('string')(function(broadcast, message) {
			delete this._bookmarks[broadcast + this._SEPARATOR + message];
			message = this._stamp(message);
			gui.Tick.next(function() {
				gui.Broadcast.dispatchGlobal(broadcast, message);
				if (this.spirit) { // TODO (jmo@): better angle on destructed spirit!
					this.spirit.life.dispatch(
							ts.ui.LIFE_STATUS_DONE,
							this._stamp(message)
					);
				}
			}, this);
		})

	}, { // Static ........................................................

		/**
		 * Report busy.
		 * @param {String} message
		 */
		busy: confirmed('string')(function(message) {
			gui.Broadcast.dispatchGlobal(BUSY1, message);
		}),

		/**
		 * Report done.
		 * @param {String} message
		 */
		done: confirmed('string')(function(message) {
			gui.Tick.next(function() {
				gui.Broadcast.dispatchGlobal(DONE1, message);
			});
		}),

		/**
		 * Report busy blocking.
		 * @param {String} message
		 */
		busyBlocking: confirmed('string')(function(message) {
			gui.Broadcast.dispatchGlobal(BUSY2, message);
		}),

		/**
		 * Report done blocking.
		 * @param {String} message
		 */
		doneBlocking: confirmed('string')(function(message) {
			var broadcast = ts.ui.BROADCAST_GLOBAL_STATUS_DONE_BLOCKING;
			gui.Tick.next(function() {
				gui.Broadcast.dispatchGlobal(DONE2, message);
			});
		})

	});
}(gui.Arguments.confirmed));
