/**
 * Spirits module.
 */
gui.module('gui-spirits@wunderbyte.com', {
	/**
	 * Channel spirits for CSS selectors.
	 */
	channel: [
		['html', gui.DocumentSpirit],
		['.gui-iframe', gui.IframeSpirit],
		['.gui-spirit', gui.Spirit]
	],

	/**
	 * Assign plugins to property names.
	 */
	plugin: {
		super: gui.SuperPlugin, // TODO: for all gui.Class things!
		action: gui.ActionPlugin,
		broadcast: gui.BroadcastPlugin,
		tick: gui.TickPlugin,
		att: gui.AttPlugin,
		config: gui.ConfigPlugin,
		box: gui.BoxPlugin,
		css: gui.CSSPlugin,
		dom: gui.DOMPlugin,
		event: gui.EventPlugin,
		life: gui.LifePlugin,
		sprite: gui.SpritePlugin
	},

	/**
	 * Add methods to (all) spirits.
	 */
	mixin: {
		/**
		 * Handle action.
		 * @param {gui.Action} action
		 */
		onaction: function(action) {},

		/**
		 * Handle broadcast.
		 * @param {gui.Broadcast} broadcast
		 */
		onbroadcast: function(broadcast) {},

		/**
		 * Handle tick (timed event).
		 * @param {gui.Tick} tick
		 */
		ontick: function(tick) {},

		/**
		 * Handle attribute.
		 * @param {gui.Att} att
		 */
		onatt: function(att) {},

		/**
		 * Handle event.
		 * @param {Event} event
		 */
		onevent: function(event) {},

		/**
		 * Handle lifecycle event.
		 * @param {gui.Life} life
		 */
		onlife: function(life) {},

		/**
		 * Native DOM interface. We'll forward the event to the method `onevent`.
		 * @see http://www.w3.org/TR/DOM-Level-3-Events/#interface-EventListener
		 * TODO: Move this code into {gui.EventPlugin}
		 * @param {Event} e
		 */
		handleEvent: function(e) {
			if (e.type === 'webkitTransitionEnd') {
				// TODO: move to {gui.EventPlugin}
				e = {
					type: 'transitionend',
					target: e.target,
					currentTarget: e.currentTarget,
					propertyName: e.propertyName,
					elapsedTime: e.elapsedTime,
					pseudoElement: e.pseudoElement
				};
			}
			this.onevent(e);
		},

		// presumably some kind of hotfix for not conflicting
		// callbacks with destructed spirits, but why here???
		$ondestruct: gui.Combo.before(function() {
			this.handleEvent = function() {};
		})(gui.Spirit.prototype.$ondestruct)
	}
});
