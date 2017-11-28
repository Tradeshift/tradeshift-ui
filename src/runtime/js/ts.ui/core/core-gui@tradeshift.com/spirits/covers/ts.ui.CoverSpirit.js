/**
 * Spirit of the cover. Use it to cover stuff up. Note that the cover should
 * be fitted with a background-color in CSS in order to actually cover stuff.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 */
ts.ui.CoverSpirit = (function using(chained, Client) {
	var MOUSE_EVENTS = Client.isTouchDevice ? 'touchstart mouseenter' : 'mousedown mouseenter';
	var CLASS_VISIBLE = ts.ui.CLASS_VISIBLE;
	var CLASS_COVER = ts.ui.CLASS_COVER;
	return ts.ui.Spirit.extend(
		{
			/**
			 * Pending a current glitch in Chrome where multiple simultaneous
			 * transitions freak out, we have disabled cover fades in WebKit.
			 * UPDATE: We're pushing our luck with WebKit again...
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.css.add(CLASS_COVER);
			},

			/**
			 * Show the cover.
			 * @return {ts.ui.CoverSpirit}
			 */
			show: chained(function() {
				this.event.add(MOUSE_EVENTS);
				this.dom.show();
			}),

			/**
			 * Hide the cover.
			 * @return {ts.ui.CoverSpirit}
			 */
			hide: chained(function() {
				this.event.remove(MOUSE_EVENTS);
				this.dom.hide();
			}),

			/**
			 * Start spinning (on a transparent background, unless you CSS this).
			 * @param @optional {string} message
			 * @returns {ts.ui.CoverSpirit}
			 */
			spin: chained(function(message) {
				this._spinner = this._spinner || ts.ui.SpinnerSpirit.summon();
				this._spinner.spin(this.element, {
					message: message || ''
				});
			}),

			/**
			 * Stop spinning.
			 * @return {ts.ui.CoverSpirit}
			 */
			stop: chained(function() {
				if (this._spinner) {
					this._spinner.stop();
				}
			}),

			/**
			 * Show or hide the cover.
			 * @param {boolean} show
			 * @return {ts.ui.CoverSpirit}
			 */
			shift: chained(function(show) {
				if (show) {
					this.show();
				} else {
					this.hide();
				}
			}),

			/**
			 * Position the cover.
			 * @param {gui.Geometry|object} geo
			 * @return {ts.ui.CoverSpirit}
			 */
			position: chained(function(geo) {
				this.css.style({
					top: geo.y,
					left: geo.x,
					width: geo.w,
					height: geo.h
				});
			}),

			/**
			 * Show and fade to no opacity.
			 */
			fadeIn: function() {
				var BROWSER_GLITCH_TIME = 25;
				this._shouldbevisible = true;
				this.show();
				if (!this._transitioning) {
					this._transitioning = true;
					this.event.add('transitionend');
					this._timeout = this.tick.time(function() {
						this.css.add(CLASS_VISIBLE);
					}, BROWSER_GLITCH_TIME);
				}
			},

			/**
			 * Fade to full opacity and hide.
			 */
			fadeOut: function() {
				var BROWSER_GLITCH_TIME = 25;
				this._shouldbevisible = false;
				if (!this._transitioning) {
					this._transitioning = true;
					this.event.add('transitionend');
					this.tick.time(function() {
						this.css.remove(CLASS_VISIBLE);
					}, BROWSER_GLITCH_TIME);
				} else if (!this.css.contains(CLASS_VISIBLE)) {
					this.tick.cancelTime(this._timeout);
					this.event.remove('transitionend');
					this._transitioning = false;
					this.hide();
				}
			},

			/**
			 * Closeing all ASIDEs when cover is clicked.
			 * Also maintaining ASIDE class and display.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				var id = this.element.id;
				switch (e.type) {
					case 'mousedown':
					case 'touchstart':
						if (id) {
							this.broadcast.dispatchGlobal(ts.ui.BROADCAST_GLOBAL_COVER_TOUCH, id);
						}
						break;
					case 'mouseenter': // probably related to the Client-Docs chrome...
						if (id) {
							this.broadcast.dispatchGlobal(ts.ui.BROADCAST_GLOBAL_COVER_HOVER, id);
						}
						break;
					case 'transitionend':
						if (e.target === this.element) {
							this._transitioning = false;
							this.event.remove('transitionend');
							if (this.css.contains(CLASS_VISIBLE)) {
								if (!this._shouldbevisible) {
									this.fadeOut();
								}
							} else {
								if (this._shouldbevisible) {
									this.fadeIn();
								} else {
									this.hide();
								}
							}
						}
						break;
				}
			},

			// Private .................................................................

			/**
			 * Scheduling fadeIn.
			 * @type {number}
			 */
			_timeout: -1,

			/**
			 * Spirit of the Spinner.
			 * @type {ts.ui.SpinnerSpirit}
			 */
			_spinner: null,

			/**
			 * Tracking a transitional state.
			 * @type {boolean}
			 */
			_shouldbevisible: false
		},
		{
			// Static ...............................................................

			/**
			 * Summon spirit.
			 * @param @optional {gui.Geometry|object} opt_geo
			 * @returns {gui.CoverSpirit}
			 */
			summon: function(opt_geo) {
				var spirit = this.possess(document.createElement('div'));
				spirit.css.add(CLASS_COVER);
				if (opt_geo) {
					spirit.position(opt_geo);
				}
				return spirit;
			},

			/**
			 * Get-create CoverSpirit with ID and classname. First
			 * run creates the spirit and appends it to the BODY.
			 * @param {string} token For both ID and classname
			 * @param @optional {Element} target Where to append the cover
			 * @returns {ts.ui.CoverSpirit}
			 */
			getCover: function(token, target) {
				return (
					gui.DOMPlugin.qdoc('.' + token, this) ||
					(function() {
						var spirit = ts.ui.CoverSpirit.summon();
						spirit.dom.appendTo(target || document.body);
						spirit.css.add(token);
						spirit.dom.id(token);
						return spirit;
					})()
				);
			}
		}
	);
})(gui.Combo.chained, gui.Client);
