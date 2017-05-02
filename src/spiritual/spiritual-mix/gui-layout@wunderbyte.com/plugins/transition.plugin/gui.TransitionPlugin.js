/**
 * Experimental CSS transitioning plugin. Work in progress.
 * @extends {gui.Plugin}
 * @TODO Just add the transitonend listener on construct?
 */
gui.TransitionPlugin = gui.Plugin.extend({
	/**
	 * Handle event.
	 * @type {TransitionEvent} e
	 */
	onevent: function(e) {
		if (e.type === this._endevent && e.target === this.spirit.element) {
			this._transitionend(e);
		}
	},

	/**
	 * Set transition properties.
	 * @param {String} props White-space separated list of CSS properties.
	 * @returns {gui.TransitionPlugin}
	 */
	property: function(props) {
		if (props) {
			this.spirit.css.set('-beta-transition-property', props);
		}
		return this._init();
	},

	/**
	 * Set transition duration.
	 * @param {object} time CSS-string or milliseconds as number.
	 * @returns {gui.TransitionPlugin}
	 */
	duration: function(time) {
		if (time) {
			time = gui.Type.isNumber(time) ? this._convert(time) : time;
			this.spirit.css.set('-beta-transition-duration', time);
		}
		return this._init();
	},

	/**
	 * Set transition timing function.
	 * @param {String} timing Bezier or keyword
	 * @returns {gui.TransitionPlugin}
	 */
	timing: function(timing) {
		if (timing) {
			this.spirit.css.set('-beta-transition-timing-function', timing);
		}
		return this._init();
	},

	/**
	 * Ease in.
	 * @returns {gui.TransitionPlugin}
	 */
	easeIn: function() {
		return this.timing('ease-in');
	},

	/**
	 * Ease out.
	 * @returns {gui.TransitionPlugin}
	 */
	easeOut: function() {
		return this.timing('ease-out');
	},

	/**
	 * Ease in and out.
	 * @returns {gui.TransitionPlugin}
	 */
	easeInOut: function() {
		return this.timing('ease-in-out');
	},

	/**
	 * Cubic-bezier.
	 * @param {number} n1
	 * @param {number} n2
	 * @param {number} n3
	 * @param {number} n4
	 * @returns {gui.TransitionPlugin}
	 */
	cubicBezier: function(n1, n2, n3, n4) {
		return this.timing('cubic-bezier(' + n1 + ',' + n2 + ',' + n3 + ',' + n4 + ')');
	},

	/**
	 * Suspend transitions.
	 * @returns {gui.TransitionPlugin}
	 */
	none: function() {
		return this.property('none');
	},

	/**
	 * Cosmetically clear traces of transition from (inline) HTML.
	 * @TODO: clear out the non transition related CSS declarations!
	 */
	reset: function() {
		this.property('');
		this.timing('');
	},

	/**
	 * Configure transition and run one or CSS updates. Any key in the config
	 * argument that matches a method name in this plugin will be invoked with
	 * the property value as argument; the rest will be treated as CSS updates.
	 * @param {Map<String,object>} config
	 * @returns {object}
	 */
	run: function(config) {
		var css = Object.create(null);
		this._count = 0;
		gui.Object.each(
			config,
			function(key, value) {
				if (gui.Type.isFunction(this[key])) {
					this[key](value);
				} else {
					css[key] = value;
				}
			},
			this
		);
		var now = this.spirit.css.compute('-beta-transition-property') === 'none';
		var then = (this._then = new gui.Then());
		// Firefox needs a break before setting the styles.
		// http://stackoverflow.com/questions/6700137/css-3-transitions-with-opacity-chrome-and-firefox
		var spirit = this.spirit;
		if ((this._count = Object.keys(css).length)) {
			setImmediate(function() {
				spirit.css.style(css);
				if (now && then) {
					setImmediate(function() {
						then.now(null); // don't wait for transitionend
					});
				}
			});
		}
		return then;
	},

	// Private ..............................................................................

	/**
	 * Default transition duration time milliseconds.
	 * @TODO actually default this
	 * @type {number}
	 */
	_default: 1000,

	/**
	 * Browsers's take on transitionend event name.
	 * @type {String}
	 */
	_endevent: null,

	/**
	 * Hello.
	 * @type {number}
	 */
	_count: 0,

	/**
	 * Monitor transitions using vendor-prefixed event name.
	 * @TODO confirm VendorTransitionEnd on documentElement
	 * @TODO Firefox is down
	 * @TODO this.duration ( this._default )
	 * @TODO this on static, not per instance
	 * @returns {gui.TransitionPlugin}
	 */
	_init: function() {
		if (this._endevent === null) {
			var names = {
				webkit: 'webkitTransitionEnd',
				explorer: 'transitionend',
				gecko: 'transitionend',
				opera: 'oTransitionEnd'
			};
			this._endevent = names[gui.Client.agent] || 'transitionend';
			this.spirit.event.add(this._endevent, this.spirit.element, this);
		}
		return this;
	},

	/**
	 * Execute and reset callback on transition end.
	 * @param {TransitionEvent} e
	 */
	_transitionend: function(e) {
		var t = new gui.Transition(e.propertyName, e.elapsedTime);
		this._ontransition(t);
		this.spirit.ontransition(t);
	},

	/**
	 * Invoke callback when properties transitioned via run() has finished.
	 * @param	{gui.Transition} t
	 */
	_ontransition: function(t) {
		if (--this._count === 0) {
			this._now();
		}
	},

	/**
	 * Now what.
	 */
	_now: function() {
		var then = this._then;
		if (then) {
			then.now(null); // don't wait for transitionend
		}
	},

	/**
	 * Compute milliseconds duration in CSS terms.
	 * @param @optional {number} ms Duration in milliseconds
	 * @returns {String} Duration as string
	 */
	_convert: function(ms) {
		ms = ms || this._default;
		return ms / 1000 + 's';
	}
});
