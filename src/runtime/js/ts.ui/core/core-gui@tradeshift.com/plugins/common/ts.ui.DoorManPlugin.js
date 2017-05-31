/**
 * The DoorManPlugin attempts to ensure a unified interface 
 * for opening and closing Asides, SideBars and Modals.
 * @extends {ts.ui.Plugin}
 * @using {gui.Type}
 */
ts.ui.DoorManPlugin = (function(Type) {
	// custom dom events (for public consumption)
	// TODO: These are now used in SideBars and Modals and should be renamed!!!!!!
	var domevent = {
		WILLOPEN: ts.ui.EVENT_ASIDE_WILL_OPEN,
		DIDOPEN: ts.ui.EVENT_ASIDE_DID_OPEN,
		WILLCLOSE: ts.ui.EVENT_ASIDE_WILL_CLOSE,
		DIDCLOSE: ts.ui.EVENT_ASIDE_DID_CLOSE
	};

	return ts.ui.Plugin.extend(
		{
			/**
			 * In debug mode, make sure that the host (spirit) is set up correctly.
			 */
			onconstruct: function() {
				this.super.onconstruct();
				if (gui.debug) {
					this._confirminterface();
				}
			},

			/**
			 * Open AND close the aside (setup to support HTML `data-ts.open="true|false"`)
			 * @param @optional {boolean} opt_open Omit to simply open.
			 * @returns {boolean} True if allowed to open
			 */
			open: function(opt_open) {
				var spirit = this.spirit;
				if (!Type.isBoolean(opt_open)) {
					opt_open = true;
				}
				if (this._shouldattempt(opt_open)) {
					if (opt_open) {
						if (!spirit.isOpen) {
							return this._maybeopen(spirit.life.async);
						}
					} else {
						if (spirit.isOpen) {
							return this._maybeclose(spirit.life.async);
						}
					}
				}
				return false;
			},

			/**
			 * The host (spirit) should make sure to call this when fully opened.
			 * This likely dependes on some CSS transition or animation or such.
			 */
			didopen: function() {
				this._execute('onopened');
				this.spirit.event.dispatch(domevent.DIDOPEN, {
					bubbles: true
				});
			},

			/**
			 * The host (spirit) should make sure to call this when fully closed.
			 */
			didclose: function() {
				this._execute('onclosed');
				this.spirit.event.dispatch(domevent.DIDCLOSE, {
					bubbles: true
				});
			},

			// Private .................................................................

			/**
			 * Fire custom DOM event and return whether or not this was preventDefaulted.
			 * @param {boolean} open
			 * @returns {boolean}
			 */
			_shouldattempt: function(open) {
				var events = this.spirit.event;
				if (open !== this.spirit.isOpen) {
					return events.dispatch(open ? domevent.WILLOPEN : domevent.WILLCLOSE, {
						bubbles: true,
						cancelable: true
					});
				}
				return false;
			},

			/**
			 * Execute callback configured via HTML attribute or via JS property.
			 * The 'this' keyword points to the element or the spirit respectively.
			 * @type {String|function}
			 * @returns {boolean}
			 */
			_execute: function(callback) {
				var spirit = this.spirit;
				if ((callback = spirit[callback])) {
					switch (gui.Type.of(callback)) {
						case 'string':
							return new Function(callback).call(spirit);
						case 'function':
							return callback.call(spirit);
					}
				}
				return true;
			},

			/**
			 * Opening.
			 * @param {boolean} animated (TODO)
			 * @returns {boolean}
			 */
			_maybeopen: function(animated) {
				var ok = this._execute('onopen') !== false;
				if (ok) {
					this.spirit.isOpen = true;
					this.spirit.att.set('data-ts.open', true);
					this.spirit.$onopen(animated);
				}
				return ok;
			},

			/**
			 * Closing.
			 * @param {boolean} animated (TODO)
			 * @returns {boolean}
			 */
			_maybeclose: function(animated) {
				var ok = this._execute('onclose') !== false;
				if (ok) {
					this.spirit.isOpen = false;
					this.spirit.att.set('data-ts.open', false);
					this.spirit.$onclose(animated);
				}
				return ok;
			},

			/**
			 * Confirm methods implemented or at least stubbed with `null`.
			 */
			_confirminterface: function() {
				var apis = 'isOpen onopen onopened onclose onclosed $onopen $onclose';
				var host = this.spirit;
				apis.split(' ').forEach(function(api) {
					if (host[api] === undefined) {
						throw new Error('Missing interface "' + api + '"');
					}
				});
			}
		},
		{
			// Static ...............................................................

			/**
			 * This plugins gets newed up automatically along with the spirit.
			 * @type {boolean}
			 */
			lazy: false
		}
	);
})(gui.Type);
