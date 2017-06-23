/**
 * Some kind of special map with strings keys and arrays values.
 * TODO: Refactor the various {gui.TrackerPlugin} implementations to use this.
 * @using {gui.Arguments#confirmed}
 * @using {gui.Array} GuiArray
 */
gui.MapList = (function using(confirmed, GuiArray) {
	function MapList(Fit) {
		this._map = Object.create(null);
		this._fit = Fit || null;
	}

	MapList.prototype = {
		/**
		 * Get list indexed by key.
		 * @param {string} key
		 * @returns {Array}
		 */
		get: function(key) {
			return this._map[key];
		},

		/**
		 * Set list by key (you would normally `add` entries instead, see below).
		 * @param {string} key
		 * @param {Array} val
		 */
		set: confirmed('string', 'array')(function(key, val) {
			this._map[key] = val;
			return this._map[key];
		}),

		/**
		 * Has list indexed by key?
		 * @param {string} key
		 * @returns {boolean}
		 */
		has: function(key) {
			return this._map[key] !== undefined;
		},

		/**
		 * Delete list indexed by key.
		 * TODO: Support function arg for destructing members of the list?
		 * @param {string} key
		 */
		delete: function(key) {
			this._map[key] = null;
			delete this._map[key];
		},

		/**
		 * Push entry to list indexed by key.
		 * Don't push no double entries here.
		 * Creates the list on first push.
		 * Return true if not already added.
		 * @param {string} key
		 * @param {object} val
		 * @returns {boolean} True if *not* already added
		 */
		add: confirmed('string')(function(key, val) {
			var list = this.get(key) || this.set(key, []);
			var puts = list.indexOf(val) === -1;
			if (puts) {
				if (this._fit && !(val instanceof this._fit)) {
					throw new TypeError(val + ' is not a ' + this._fit);
				}
				list.push(val);
			}
			return puts;
		}),

		/**
		 * Remove entry from list index by key. Deletes the list when empty.
		 * @param {string} key
		 * @param {object} val
		 */
		remove: confirmed('string')(function(key, val) {
			var length,
				list = this.get(key);
			if (list) {
				length = GuiArray.remove(list, val);
				if (length === 0) {
					this.delete(key);
				}
			}
		}),

		/**
		 * @param {function} callback
		 * @param @optional {object} thisp
		 */
		each: function(callback, thisp) {
			gui.Object.each(this._map, function(key, list) {
				callback.call(thisp, key, list);
			});
		},

		// Private .................................................................

		/**
		 * @type {Map<string,Array>}
		 */
		_map: null,

		/**
		 * @type {constructor}
		 */
		_fit: null
	};

	return MapList;
})(gui.Arguments.confirmed, gui.Array);
