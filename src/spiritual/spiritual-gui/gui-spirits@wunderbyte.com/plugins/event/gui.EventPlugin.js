/**
 * Tracking DOM events.
 * TODO Static interface for general consumption.
 * @extends {gui.TrackerPlugin}
 * @using {gui.Combo#chained} chained
 * @using {gui.Array} guiArray
 * @using {gui.DOMPlugin} DOMplugin
 * @using {gui.Interface} Interface
 * @uisng {gui.Type} Type
 */
gui.EventPlugin = (function using(chained, guiArray, DOMPlugin, Interface, Type) {
	return gui.TrackerPlugin.extend({
		/**
		 * Add one or more DOM event handlers.
		 * TODO: Don't assume spirit handler
		 * @param {object} arg String, array or whitespace-separated-string
		 * @param @optional {object} target Node, Window or XmlHttpRequest. Defaults to spirit element
		 * @param @optional {object} handler implements {gui.IEventHandler}, defaults to spirit
		 * @param @optional {boolean} capture Defaults to false
		 * @returns {gui.EventPlugin}
		 */
		add: chained(function(arg, target, handler, capture) {
			target = this._getelementtarget(target);
			if (target.nodeType || Type.isWindow(target)) {
				handler = handler || this.spirit;
				capture = capture || false;
				if (Interface.validate(gui.IEventHandler, handler)) {
					var checks = [target, handler, capture];
					this._breakdown(arg).forEach(function(type) {
						if (this._addchecks(type, checks)) {
							this._shiftEventListener(true, target, type, handler, capture);
						}
					}, this);
				}
			} else {
				throw new TypeError('Invalid target: ' + target + ' (' + this.spirit.$classname + ')');
			}
		}),

		/**
		 * Add one or more DOM event handlers.
		 * @param {object} arg String, array or whitespace-separated-string
		 * @param @optional {object} target Node, Window or XmlHttpRequest. Defaults to spirit element
		 * @param @optional {object} handler implements {gui.IEventHandler}, defaults to spirit
		 * @param @optional {boolean} capture Defaults to false
		 * @returns {gui.EventPlugin}
		 */
		remove: chained(function(arg, target, handler, capture) {
			target = this._getelementtarget(target);
			if (target.nodeType || Type.isWindow(target)) {
				handler = handler || this.spirit;
				capture = capture || false;
				if (Interface.validate(gui.IEventHandler, handler)) {
					var checks = [target, handler, capture];
					this._breakdown(arg).forEach(function(type) {
						if (this._removechecks(type, checks)) {
							this._shiftEventListener(false, target, type, handler, capture);
						}
					}, this);
				}
			} else {
				throw new TypeError('Invalid target: ' + target + ' (' + this.spirit.$classname + ')');
			}
		}),

		/**
		 * Toggle one or more DOM event handlers.
		 * @param {object} arg String, array or whitespace-separated-string
		 * @param @optional {object} target Node, Window or XmlHttpRequest. Defaults to spirit element
		 * @param @optional {object} handler implements EventListener interface, defaults to spirit
		 * @param @optional {boolean} capture Defaults to false
		 * @returns {gui.EventPlugin}
		 */
		toggle: chained(function(arg, target, handler, capture) {
			target = this._getelementtarget(target);
			handler = handler || this.spirit;
			capture = capture || false;
			if (target instanceof gui.Spirit) {
				target = target.element;
			}
			var checks = [target, handler, capture];
			guiArray.make(arg).forEach(function(type) {
				if (this._contains(type, checks)) {
					this.add(type, target, handler, capture);
				} else {
					this.remove(type, target, handler, capture);
				}
			}, this);
		}),

		/**
		 * Dispatch event.
		 * https://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#customeventinit
		 * http://stackoverflow.com/questions/5342917/custom-events-in-ie-without-using-libraries
		 * @param {string} type
		 * @param @optional {Map} params TODO: If not supported in IE(?), deprecate???
		 * @returns {boolean} True if the event was cancelled (prevetDefaulted)
		 */
		dispatch: function(type, params) {
			var elm = this.spirit.element,
				evt = null;
			if (window.CustomEvent && !gui.Client.isExplorer) {
				// TODO: IE version???
				evt = new CustomEvent(type, params);
			} else {
				params = params || {
					bubbles: false,
					cancelable: false,
					detail: undefined
				};
				evt = document.createEvent('HTMLEvents');
				evt.initEvent(type, params.bubbles, params.cancelable);
			}
			evt.eventName = type;
			if (elm.dispatchEvent) {
				return elm.dispatchEvent(evt);
			} else if (elm[type]) {
				return elm[type]();
			} else if (elm['on' + type]) {
				return elm['on' + type]();
			}
		},

		/**
		 * TODO: Delete this if Safari supports natively (and otherwise not used)
		 * Handle special event.
		 * @param {Event} e
		 */
		handleEvent: function(e) {
			var related = e.relatedTarget;
			var element = this.spirit.element;
			var inorout = related && related !== element && !DOMPlugin.contains(element, related);
			switch (e.type) {
				case 'mouseover':
					if (inorout && this._mouseenter) {
						this.spirit.onevent(this._getfakeevent(e, 'mouseenter'));
					}
					break;
				case 'mouseout':
					if (inorout && this._mouseleave) {
						this.spirit.onevent(this._getfakeevent(e, 'mouseleave'));
					}
					break;
			}
		},

		// Private .................................................................

		/**
		 * Tracking `mouseenter`?
		 * @type {boolean}
		 */
		_mouseenter: false,

		/**
		 * Tracking `mouseout`?
		 * @type {boolean}
		 */
		_mouseleave: false,

		/**
		 * Actual event registration has been isolated so that
		 * one may overwrite or overload this particular part.
		 * @param {boolean} add
		 * @param {Node} target
		 * @param {string} type
		 * @param {object} handler
		 * @param {boolean} capture
		 */
		_shiftEventListener: function(add, target, type, handler, capture) {
			var action = add ? 'addEventListener' : 'removeEventListener';
			target[action](type, handler, capture);
		},

		/**
		 * TODO: Delete this if Safari supports natively!
		 * Reform vendor specific event types to standard event types.
		 * TODO: Elaborate setup to support vendor events universally
		 * @param {boolean} add
		 * @param {string} type
		 * @param {IEventHandler} handler
		 */
		_enterleavetype: function(add, type, handler) {
			var spirit = this.spirit;
			if (handler === spirit) {
				switch (type) {
					case 'mouseenter':
						this._mouseenter = add;
						return 'mouseover';
					case 'mouseleave':
						this._mouseleave = add;
						return 'mouseout';
				}
			} else {
				throw new TypeError(type + ' not (yet) supported on ' + handler);
			}
		},

		/**
		 * Get element for target argument.
		 * @param {Element|gui.Spirit} target
		 * @returns {Element}
		 */
		_getelementtarget: function(target) {
			target = target || this.spirit.element;
			return target instanceof gui.Spirit ? target.element : target;
		},

		/**
		 * TODO: Delete this if Safari supports natively (and otherwise not used)
		 * Clone the DOM event into a JS
		 * object, then change the type.
		 * @param {Event} realevent
		 * @param {string} newtype
		 * @returns {object}
		 */
		_getfakeevent: function(realevent, newtype) {
			var prop,
				fakeevent = Object.create(null);
			for (prop in realevent) {
				switch (prop) {
					case 'webkitMovementX':
					case 'webkitMovementY':
						// avoid console "deprecated" warning
						break;
					default:
						fakeevent[prop] = realevent[prop];
						break;
				}
				fakeevent.type = newtype;
			}
			return fakeevent;
		},

		/**
		 * Remove event listeners.
		 * @overwrites {gui.Tracker#_cleanup}
		 * @param {String} type
		 * @param {Array<object>} checks
		 */
		_cleanup: function(type, checks) {
			var target = checks[0];
			var handler = checks[1];
			var capture = checks[2];
			this.remove(type, target, handler, capture);
		},

		/**
		 * Manhandle 'transitionend' event.
		 * @param {Array<String>|String} arg
		 * @returns {Array<String>}
		 */
		_breakdown: function(arg) {
			return guiArray.make(arg).map(function(type) {
				return type === 'transitionend' ? this._transitionend() : type;
			}, this);
		},

		/**
		 * Compute vendor prefixed 'transitionend' event name.
		 * NOTE: Chrome is unprefixed now, Safarai is still left.
		 * NOTE: Some functionality regarding the transitionend
		 *			 event still resides in the "module.js" file!
		 * @TODO: Cache the result somehow...
		 * @returns {String}
		 */
		_transitionend: function() {
			if ('transition' in document.documentElement.style) {
				return 'transitionend';
			} else {
				return 'webkitTransitionEnd';
			}
		}
	});
})(gui.Combo.chained, gui.Array, gui.DOMPlugin, gui.Interface, gui.Type);
