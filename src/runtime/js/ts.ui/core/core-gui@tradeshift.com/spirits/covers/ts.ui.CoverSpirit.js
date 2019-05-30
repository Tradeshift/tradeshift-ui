/**
 * Spirit of the cover. Use it to cover stuff up. Note that the cover should
 * be fitted with a background-color in CSS in order to actually cover stuff.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo#chained} chained
 */
ts.ui.CoverSpirit = (function using(chained, Client) {
	var MOUSE_EVENTS = Client.isTouchDevice ? 'touchstart mouseenter' : 'mousedown mouseenter';
	var CLASS_BLOCKING = 'ts-blocking';
	var CLASS_OPAQUE = 'ts-opaque';
	var CLASS_VISIBLE = ts.ui.CLASS_VISIBLE;
	var CLASS_COVER = ts.ui.CLASS_COVER;
	var COLOR_WHITE = 'rgb(255,255,255)';
	var COLOR_DARK = 'rgb(85,85,85)';
	return ts.ui.Spirit.extend(
		{
			/**
			 * TODO: remove 'ts-transition' after @dsp has deployed the Tax Selector with new scoped styles!
			 */
			onconfigure: function() {
				this.super.onconfigure();
				this.css.add(CLASS_COVER);
				this.css.add('ts-transition');
				this.event.add('transitionend');
			},

			/**
			 * Show the cover.
			 * @returns {this}
			 */
			show: chained(function() {
				this._fadeout = false;
				this.event.add(MOUSE_EVENTS);
				this.dom.show();
			}),

			/**
			 * Hide the cover (and remove potential spinner).
			 * @returns {this}
			 */
			hide: chained(function() {
				this._fadeout = false;
				this.event.remove(MOUSE_EVENTS);
				this.dom.html('').hide();
			}),

			/**
			 * Fit with semitransparent background.
			 * @param {boolean} is
			 * @returns {this|boolean}
			 */
			opaque: chained(function(is) {
				if (arguments.length) {
					this.css.shift(is, CLASS_OPAQUE);
				} else {
					return this.css.contains(CLASS_OPAQUE);
				}
			}),

			/**
			 * Block all mouse events. Note that this is not the default behavior!
			 * @param {boolean} is
			 * @returns {this|boolean}
			 */
			blocking: chained(function(is) {
				if (arguments.length) {
					this.css.shift(is, CLASS_BLOCKING);
				} else {
					return this.css.contains(CLASS_BLOCKING);
				}
			}),

			/**
			 * Start spinning.
			 * @param @optional {string} message
			 * @returns {this}
			 */
			spin: chained(function(message) {
				message = typeof message === 'string' ? message : '';
				if (this._spinner) {
					this._spinner.text(message);
				} else {
					this.dom.append(
						(this._spinner = ts.ui.SpinnerSpirit.summon(message, {
							color: this.blocking() ? COLOR_WHITE : COLOR_DARK
						}))
					);
				}
			}),

			/**
			 * Stop spinning.
			 * @returns {this}
			 */
			stop: chained(function() {
				this._spinner = null;
				this.dom.html();
			}),

			/**
			 * Show or hide the cover.
			 * @param {boolean} show
			 * @returns {this}
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
			 * @returns {this}
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
			 * @returns {gui.Then}
			 */
			fadeIn: function() {
				this.show();
				this._then = new gui.Then();
				if (!this.css.contains(CLASS_VISIBLE)) {
					this.css.add(CLASS_VISIBLE);
				}
				return this._then;
			},

			/**
			 * Fade to full opacity and hide.
			 * @returns {gui.Then}
			 */
			fadeOut: function() {
				this._then = new gui.Then();
				if (this.css.contains(CLASS_VISIBLE)) {
					this.css.remove(CLASS_VISIBLE);
				}
				return this._then;
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
							if (!this.css.contains(CLASS_VISIBLE)) {
								this.hide();
							}
							if (this._then) {
								this._then.now();
								this._then = null;
							}
						}
						break;
				}
			},

			// Private ...............................................................

			/**
			 * @type {gui.Then}
			 */
			_then: null,

			/**
			 * Spirit of the Spinner.
			 * @type {ts.ui.SpinnerSpirit}
			 */
			_spinner: null
		},
		{
			// Static ................................................................

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
