/**
 * Tracking tweens.
 * TODO: Support 'handler' typeument!
 * @extends {gui.TrackerPlugin}
 * @using {gui.Combo#chained}
 * @using {gui.Arguments#confirmed}
 */
gui.TweenPlugin = (function using(chained, confirmed) {
	return gui.TrackerPlugin.extend({
		/**
		 * Add tween listener(s).
		 * @param {String|Array<String>} type
		 * @returns {gui.TweenPlugin}
		 */
		add: chained(
			confirmed('string')(function(type) {
				gui.Array.make(type).forEach(function(_type) {
					if (this._addchecks(_type)) {
						gui.Broadcast.add(gui.BROADCAST_TWEEN, this);
					}
				}, this);
			})
		),

		/**
		 * Remove tween listener(s).
		 * @param {String|Array<String>} type
		 * @returns {gui.TweenPlugin}
		 */
		remove: chained(
			confirmed('string')(function(type) {
				gui.Array.make(type).forEach(function(_type) {
					if (this._removechecks(_type)) {
						gui.Broadcast.remove(gui.BROADCAST_TWEEN, this);
					}
				}, this);
			})
		),

		/**
		 * Dispatch tween(s).
		 * @param {String|Array<String>} type
		 * @param @optional {object} options Configure timing etc.
		 * @param @optional {object} data Optional data thingy
		 * @returns {gui.Tween} TODO: Don't return anything!!!
		 */
		dispatch: confirmed('string')(function(type, options, data) {
			var result = null;
			gui.Array.make(type).forEach(function(_type) {
				result = gui.Tween.dispatch(_type, options, data);
			}, this);
			return result;
		}),

		/**
		 * Add tween listener and dispatch this tween.
		 * TODO: We have to find a different setup for this,
		 *			 at least we have to change this method name.
		 * @param {String|Array<String>} type
		 * @param @optional {object} options Configure timing etc.
		 * @param @optional {object} data Optional data thingy
		 * @returns {gui.Tween}
		 */
		addDispatch: function(type, options, data) {
			return this.add(type).dispatch(type, options, data);
		},

		/**
		 * Handle broadcast.
		 * @param {gui.Broadcast} b
		 */
		onbroadcast: function(b) {
			switch (b.type) {
				case gui.BROADCAST_TWEEN:
					var tween = b.data;
					if (this._containschecks(tween.type)) {
						if (!this.spirit.life.destructed) {
							this.spirit.ontween(tween);
						}
					}
					break;
			}
		},

		/**
		 * [ondestruct description]
		 * @return {[type]} [description]
		 */
		ondestruct: function() {
			gui.Broadcast.remove(gui.BROADCAST_TWEEN, this);
			this.super.ondestruct();
		}
	});
})(gui.Combo.chained, gui.Arguments.confirmed);
