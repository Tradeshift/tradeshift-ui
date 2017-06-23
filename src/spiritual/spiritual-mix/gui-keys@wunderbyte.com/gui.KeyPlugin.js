/**
 * Tracking keys.
 * @extends {gui.TrackerPlugin}
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
gui.KeyPlugin = (function using(confirmed, chained) {
	return gui.TrackerPlugin.extend({
		/**
		 * Add one or more action handlers.
		 * @param {Array<String,Number>|String|number} arg @TODO Strings!
		 * @param @optional {object|function} handler
		 * @returns {gui.KeyPlugin}
		 */
		add: confirmed('array|string', '(object|function)')(
			chained(function(arg, handler) {
				handler = handler || this.spirit;
				if (gui.Interface.validate(gui.IKeyHandler, handler)) {
					gui.Array.make(arg).forEach(function(a) {
						if (this._addchecks(String(a), [handler, this._global])) {
							this._setupbroadcast(true);
						}
					}, this);
				}
			})
		),

		/**
		 * Remove one or more action handlers.
		 * @param {Array<String,Number>|String|number} arg
		 * @param @optional {object} handler
		 * @returns {gui.KeyPlugin}
		 */
		remove: confirmed('array|string', '(object|function)')(
			chained(function(arg, handler) {
				handler = handler || this.spirit;
				if (gui.Interface.validate(gui.IKeyHandler, handler)) {
					gui.Array.make(arg).forEach(function(a) {
						if (this._removechecks(String(a), [handler, this._global])) {
							if (!this._hashandlers()) {
								this._setupbroadcast(false);
							}
						}
					}, this);
				}
			})
		),

		/**
		 * Add handlers for global key(s).
		 * @param {object} arg
		 * @param @optional {gui.IKeyListener} handler (defaults to spirit)
		 * @returns {gui.KeyPlugin}
		 */
		addGlobal: function(arg, handler) {
			return this._globalize(function() {
				return this.add(arg, handler);
			});
		},

		/**
		 * Add handlers for global keys(s).
		 * @param {object} arg
		 * @param @optional {gui.IKeyListener} handler (defaults to spirit)
		 * @returns {gui.KeyPlugin}
		 */
		removeGlobal: function(arg, handler) {
			return this._globalize(function() {
				return this.remove(arg, handler);
			});
		},

		/**
		 * Handle broadcast.
		 * @param {gui.Broadcast} b
		 */
		onbroadcast: function(b) {
			var list, handler, isglobal;
			if (b.type === gui.BROADCAST_KEYEVENT) {
				var down = b.data.down,
					type = b.data.type;
				if ((list = this._trackedtypes[type])) {
					list.forEach(function(checks) {
						handler = checks[0];
						isglobal = checks[1];
						if (isglobal === b.global) {
							handler.onkey(new gui.Key(down, type, isglobal));
						}
					});
				}
			}
		},

		// Private .....................................................................

		/**
		 * Start and stop listening for broadcasted key event details.
		 * @param {boolean} add
		 */
		_setupbroadcast: function(add) {
			var act,
				sig = this.context.gui.$contextid;
			var type = gui.BROADCAST_KEYEVENT;
			if (this._global) {
				act = add ? 'addGlobal' : 'removeGlobal';
				gui.Broadcast[act](type, this);
			} else {
				act = add ? 'add' : 'remove';
				gui.Broadcast[act](type, this, sig);
			}
		},

		/**
		 * Remove delegated handlers.
		 * @TODO same as in gui.ActionPlugin, perhaps superize this stuff somehow...
		 */
		_cleanup: function(type, checks) {
			var handler = checks[0],
				global = checks[1];
			if (global) {
				this.removeGlobal(type, handler);
			} else {
				this.remove(type, handler);
			}
		}
	});
})(gui.Arguments.confirmed, gui.Combo.chained);
