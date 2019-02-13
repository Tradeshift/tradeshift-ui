/**
 * Tracking dialogs to manage the cover.
 * Syncing with the top dialog plugin.
 * @see {ts.top.DocumentDialogPlugin}
 */
ts.ui.DocumentDialogPlugin = (function() {
	// local broadcasts *from* dialogs in this context
	var willopen = ts.ui.BROADCAST_DIALOG_WILL_OPEN,
		goopen = ts.ui.BROADCAST_DIALOG_GO_OPEN,
		willclose = ts.ui.BROADCAST_DIALOG_WILL_CLOSE,
		didclose = ts.ui.BROADCAST_DIALOG_DID_CLOSE,
		modal_willopen = ts.ui.BROADCAST_MODAL_WILL_OPEN,
		modal_willclose = ts.ui.BROADCAST_MODAL_WILL_CLOSE;

	// global broadcasts *for* the top frame dialog plugin
	var globalon = ts.ui.BROADCAST_GLOBAL_DIALOGS_WILL_ON,
		globaloff = ts.ui.BROADCAST_GLOBAL_DIALOGS_DID_OFF,
		globalblock = ts.ui.BROADCAST_GLOBAL_DIALOGS_WILL_BLOCK,
		globalunblock = ts.ui.BROADCAST_GLOBAL_DIALOGS_DID_UNBLOCK;

	// broadcast global
	function announce(msg) {
		gui.Broadcast.dispatchGlobal(msg);
	}

	return ts.ui.Plugin.extend({
		/**
		 * Manage the flow of dialogs.
		 */
		managedialogs: function() {
			this._dialogs = [];
			gui.Broadcast.add(
				[willopen, goopen, goopen, willclose, didclose, modal_willopen, modal_willclose],
				this
			);
		},

		/**
		 * Suspend new dialogs if a dialog is currently shown.
		 * @param {gui.Broadcast} b
		 */
		onbroadcast: function(b) {
			var queue = this._dialogs;
			var dialog = b.target;
			switch (b.type) {
				case willopen:
					if (queue.length) {
						dialog.suspend();
					} else {
						announce(globalon);
					}
					queue.push(dialog);
					break;
				case goopen:
					if (dialog) {
						this._updateblocking(dialog.blocking);
					}
					break;
				case didclose:
					queue.shift();
					if (queue.length) {
						queue[0].unsuspend();
					} else {
						this._updateblocking(false);
						announce(globaloff);
					}
					break;
				case modal_willopen:
				case modal_willclose:
					break;
			}
		},

		// Private .................................................................

		/**
		 * Current dialog blocks?
		 * @type {number}
		 */
		_blocking: false,

		/**
		 * Tracking open dialogs.
		 * TODO(jmo@): This should in reality by done	in the {ts.ui.LayoutModel}
		 * so that we can account for dialogs going on in the chrome and such.
		 * @type {Array<ts.ui.DialogSpirit}
		 */
		_dialogs: null,

		/**
		 * ID (and classname) of the aside cover.
		 * @type {string}
		 */
		_coverid: 'ts-dialogcover',

		/**
		 * Update blocking status.
		 * @param {boolean} blocking
		 */
		_updateblocking: function(blocking) {
			if (blocking) {
				if (!this._blocking) {
					announce(globalblock);
					this._cover().fadeIn();
					this._blocking = true;
				}
			} else {
				if (this._blocking) {
					announce(globalunblock);
					this._cover().fadeOut();
					this._blocking = false;
				}
			}
		},

		/**
		 * Get-create CoverSpirit for dialog things. First
		 * run creates the spirit and appends it to BODY.
		 * @returns {ts.ui.CoverSpirit}
		 */
		_cover: function() {
			return ts.ui.CoverSpirit.getCover(this._coverid);
		}
	});
})();
