/**
 * Add support for special events.
 * @extends {gui.EventPlugin} and notably not the {ts.ui.Plugin}
 */
ts.ui.EventPlugin = gui.EventPlugin.extend(
	{
		/**
		 * Handle event.
		 * @param {Event} e
		 */
		handleEvent: function(e) {
			this.super.handleEvent(e);
			var fake,
				time,
				spirit = this.spirit;
			switch (e.type) {
				case 'mouseenter':
					if (this._hoverintent) {
						fake = this._getfakeevent(e, 'hoverintent');
						time = ts.ui.EventPlugin.HOVER_INTENT_TIME;
						this._hovercountdown = gui.Tick.time(function() {
							spirit.onevent(fake);
						}, time);
					}
					break;
				case 'mouseleave':
					if (this._hoverintent) {
						gui.Tick.cancelTime(this._hovercountdown);
					}
			}
		},

		// Private ...................................................................

		/**
		 * Tracking hoverintent?
		 * @type {boolean}
		 */
		_hoverintent: false,

		/**
		 * Hoverintent timeout index.
		 * @type {number}
		 */
		_hovercountdown: -1,

		/**
		 * Support mysterious 'hoverintent', though maybe that's not needed no more.
		 * @overrides {gui.EventPlugin._shiftEventListener}
		 * @param {boolean} add
		 * @param {Node} target
		 * @param {string} type
		 * @param {object} handler
		 * @param {boolean} capture
		 */
		_shiftEventListener: function(add, target, type, handler, capture) {
			switch (type) {
				case 'hoverintent':
					this._shiftHoverListener(add, target, type, handler, capture);
					break;
				default:
					this.super._shiftEventListener(add, target, type, handler, capture);
					break;
			}
		},

		/*
		 * TODO(jmo@): Account for `this._mouseenter` and `this._mouseleave`
		 * pending investigation of whether or not Safari supports this stuff.
		 * @param {boolean} add
		 * @param {Node} target
		 * @param {string} type
		 * @param {object} handler
		 * @param {boolean} capture
		 */
		_shiftHoverListener: function(add, target, type, handler, capture) {
			this._hoverintent = add;
			target = this._getelementtarget(target);
			if (target === this.spirit.element) {
				if (add) {
					// note that we never remove the listener (we use boolean flags)
					['mouseenter', 'mouseleave'].forEach(function(t) {
						target.addEventListener(t, this);
					}, this);
				}
			} else {
				throw new Error('Not supported just yet');
			}
		}
	},
	{},
	{
		//	Static ............................................................

		/**
		 * Timeout in milliseconds before we assume
		 * that the user intends to hover something.
		 * @type {number}
		 */
		HOVER_INTENT_TIME: 123
	}
);
