/**
 * Advanced progress model. This is only used
 * in the greenfield host frame and should
 * probably not be part of the public API.
 * TODO (jmo@): Get this out of here
 */
ts.ui.ProgressModel = ts.ui.Model.extend({
	/**
	 * Friendly name.
	 * @type {string}
	 */
	item: 'progress',

	/**
	 * Max value.
	 * @type {Number}
	 */
	max: -1,

	/**
	 * Current value.
	 * @type {Number}
	 */
	value: {
		getter: function() {
			return this._value;
		},
		setter: function(n) {
			this._value = n;
			this._update(this.value);
		}
	},

	/**
	 * Init the stuff.
	 */
	onconstruct: function() {
		this.super.onconstruct();
		this._update();
	},

	// Private ...................................................................

	/**
	 * Private value.
	 * @type {number}
	 */
	_value: 0,

	/**
	 * Broadcast progress globally.
	 * Probably not how to do it...
	 */
	_update: function() {
		var msg = ts.ui.BROADCAST_GLOBAL_PROGRESSBAR;
		gui.Broadcast.dispatchGlobal(msg, {
			id: this.$instanceid,
			max: this.max,
			value: this.value
		});
	}
});
