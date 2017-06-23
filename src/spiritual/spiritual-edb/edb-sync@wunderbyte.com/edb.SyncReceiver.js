/**
 * TODO: nuke this thing on type dispose
 * @param {edb.Type} type
 */
edb.SyncReceiver = function(type) {
	this.type = type;
};

edb.SyncReceiver.prototype = {
	/**
	 * Each type associated to an instance of {edb.SyncReceiver}
	 * @type {edb.Type}
	 */
	type: null,

	/**
	 * Handle broadcast.
	 * @param {gui.Broadcast} b
	 */
	onbroadcast: function(b) {
		var type = this.type;
		var changes = b.data;
		if (
			changes.some(function(c) {
				return c.$instanceid !== type.$instanceid;
			})
		) {
			changes.forEach(function(c) {
				this._change(type, c);
			}, this);
		}
	},

	/**
	 * Change type somehow.
	 * @param {edb.Object|edb.Array} type
	 * @param {edb.ObjectSync|edb.ArraySync} c
	 */
	_change: function(type, c) {
		switch (c.type) {
			case edb.ObjectChange.TYPE_UPDATE:
				this._objectchange(type, c);
				break;
			case edb.ArrayChange.TYPE_SPLICE:
				this._arraychange(type, c);
				break;
		}
	},

	/**
	 * Change object properties.
	 * @param {edb.Object|edb.Array} type
	 * @param {edb.ObjectSync} c
	 */
	_objectchange: function(type, c) {
		var name = c.name,
			value = c.newValue;
		if (type[name] !== value) {
			if (value && (value.$object || value.$array)) {
				// TODO is-abstract-edb-tree somehow...
				value = JSON.stringify(value);
				value = new edb.Parser().parseFromString(value);
				edb.Synchronizer.sync(value, c.$synchronizity, c.$synchglobally);
			}
			type.$willsync = true;
			type[name] = value;
		}
	},

	/**
	 * Change array structure.
	 * @param {edb.Array} type
	 * @param {edb.ArraySync} c
	 */
	_arraychange: function(type, c) {
		type.$willsync = true;
		var isobject = gui.Type.isObject;
		var x = c.args.slice(2).map(function(thing) {
			if (isobject(thing) && (thing.$object || thing.$array)) {
				thing = JSON.stringify(thing);
				thing = new edb.Parser().parseFromString(thing);
				edb.Synchronizer.sync(thing, c.$synchronizity, c.$synchglobally);
			}
			return thing;
		});
		x.unshift(c.args[1]);
		x.unshift(c.args[0]);
		type.splice.apply(type, x);
	}
};
