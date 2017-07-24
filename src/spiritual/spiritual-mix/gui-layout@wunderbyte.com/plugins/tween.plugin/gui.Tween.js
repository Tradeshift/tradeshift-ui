/**
 * Tweening away.
 */
gui.Tween = (function using(confirmed, chained) {
	return gui.Class.create(
		Object.prototype,
		{
			/**
			 * Tween type.
			 * @type {string}
			 */
			type: null,

			/**
			 * Default duration.
			 * @type {number} Time in in milliseconds.
			 */
			duration: 200,

			/**
			 * Default delay.
			 * @type {number} Time in milliseconds.
			 */
			delay: 0,

			/**
			 * Equivalent to transition-timing-function.
			 * Can be an array of 4 numbers to use a custom bezier curve.
			 * @type {string|array<number>}
			 */
			timing: 'ease',

			/**
			 * Optional tween data.
			 * @type {object}
			 */
			data: null,

			/**
			 * Between zero and one.
			 * @type {number}
			 */
			value: 0,

			/**
			 * True when value is zero.
			 * @type {Boolean}
			 */
			init: true,

			/**
			 * True when value is one.
			 * @type {boolean}
			 */
			done: false,

			/**
			 * @param {string} type
			 * @param @optional {object} config
			 * @param @optional {object} data
			 */
			onconstruct: function(type, config, data) {
				this.type = type;
				this.data = data !== undefined ? data : null;
				if (config) {
					if (config.duration !== undefined) {
						this.duration = config.duration;
					}
					if (config.timing !== undefined) {
						this.timing = config.timing;
					}
					if (config.delay !== undefined) {
						this.delay = config.delay;
					}
				}
			}
		},
		{},
		{
			// Static ...........................................................
			/**
			 * Bezier curve definitions for easing
			 */
			$easing: {
				linear: [0, 0, 1, 1],
				ease: [0.25, 0.1, 0.25, 1],
				'ease-in': [0.42, 0, 1, 1],
				'ease-out': [0, 0, 0.58, 1],
				'ease-in-out': [0.42, 0, 0.58, 1],

				'ease-in-back': [0.6, -0.28, 0.735, 0.045],
				'ease-out-back': [0.175, 0.885, 0.32, 1.275],
				'ease-in-out-back': [0.68, -0.55, 0.265, 1.55]
			},

			/**
			 * Coordinate tween.
			 * @param {string} type
			 * @param @optional {object} config
			 * @param @optional {object} data
			 * @returns {gui.Tween} but why?
			 */
			dispatch: function(type, config, data) {
				var tween = new gui.Tween(type, config, data);
				var timer = gui.Client.hasPerformance ? window.performance : Date;
				var start = timer.now();

				var easingCurve = gui.Tween.$easing.ease;
				if (
					typeof tween.timing === 'string' &&
					Object.keys(gui.Tween.$easing).indexOf(tween.timing) !== -1
				) {
					easingCurve = gui.Tween.$easing[tween.timing];
				} else if (Array.isArray(tween.timing)) {
					easingCurve = tween.timing;
				}
				var curve = new gui.UnitBezier(
					easingCurve[0],
					easingCurve[1],
					easingCurve[2],
					easingCurve[3]
				);

				function step() {
					var now = timer.now();
					var progress = now - start;

					if (tween.init) {
						if (progress > tween.delay) {
							tween.init = false;
							start = now;
							progress = 0;
						}
					}

					if (!tween.init) {
						var t = progress / tween.duration;
						if (t < 1) {
							tween.value = curve.solve(t);
						} else {
							tween.done = true;
							tween.value = 1;
						}
						gui.Broadcast.dispatch(gui.BROADCAST_TWEEN, tween);
					}

					if (!tween.done) {
						requestAnimationFrame(step);
					}
				}

				step();

				return tween;
			}
		}
	);
})(gui.Arguments.confirmed, gui.Combo.chained);
