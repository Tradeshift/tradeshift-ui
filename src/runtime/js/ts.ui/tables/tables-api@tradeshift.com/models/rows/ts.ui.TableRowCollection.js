/**
 * Advanced table row collection.
 * @extends {ts.ui.Collection}
 * @using {ts.ui.Collection} Collection
 * @using {gui.Array} GuiArray
 * @using {gui.Arguments.confirmed} TODO: something faster (big data scenario)
 */
ts.ui.TableRowCollection = (function using(Collection, GuiArray, confirmed) {
	var Super = Collection.prototype;

	/**
	 * This should really be fixed in the core somewhere, but anyways:
	 * We know for a fact that folks will serve their Angular models
	 * directly to the Table so that our state and Angulars state
	 * become entangled. Thus, we'll need to deepclone the data and
	 * work on *copies* of the data. Note that this is only a problem
	 * because we don't create models from the data (for performance
	 * reasons), since otherwise this would be sorted out already.
	 */
	function deepclone(thing) {
		return JSON.parse(JSON.stringify(thing));
	}

	return Collection.extend({
		/**
		 * Need to do this because we can accept both objects and
		 * arrays and I guess we never though about that before.
		 * TODO(jmo@): verify that this is needed and fix it in {edb.ArrayPopulator}
		 */
		$of: confirmed('object|array')(function(json) {
			return json;
		}),

		/**
		 * Deepclone before adding.
		 * @overwrites {ts.ui.Collection#push}
		 */
		push: function() {
			var args = GuiArray.from(arguments);
			var list = this._suspended ? args : deepclone(args);
			return Super.push.apply(this, list);
		},

		/**
		 * Deepclone before adding.
		 * @overwrites {ts.ui.Collection#unshift}
		 */
		unshift: function() {
			var args = GuiArray.from(arguments);
			var list = this._suspended ? args : deepclone(args);
			return Super.unshift.apply(this, list);
		},

		/**
		 * Deepclone before adding.
		 * @overwrites {ts.ui.Collection#splice}
		 */
		splice: function() {
			if (this._suspended) {
				Super.splice.apply(this, arguments);
			} else {
				var args = GuiArray.from(arguments);
				return Super.splice.apply(
					this,
					args.map(function(arg, index) {
						return index > 1 ? deepclone(arg) : arg;
					})
				);
			}
		},

		// Privileged ..............................................................

		/**
		 * We should only deepclone stuff that the user injects, not the
		 * stuff that we (ourself) array-manipulate inside the component.
		 * This method will disable deepcloning while performing an action.
		 * @param {function} action
		 * @param @optional {object} thisp
		 */
		$suspend: function(action, thisp) {
			this._suspended = true;
			var res = action.call(thisp);
			this._suspended = false;
			return res;
		},

		// Private .................................................................

		/**
		 * While true, we will not deepclone the
		 * stuff that gets added to the collection.
		 * @type {boolean}
		 */
		_suspended: false
	});
})(ts.ui.Collection, gui.Array, gui.Arguments.confirmed);
