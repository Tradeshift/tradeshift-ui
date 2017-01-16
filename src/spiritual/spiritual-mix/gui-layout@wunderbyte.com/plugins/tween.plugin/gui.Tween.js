/**
 * Tweening away.
 */
gui.Tween = (function using(confirmed, chained) {
	return gui.Class.create(Object.prototype, {

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
		 * Equivalent to transition-timing-function.
		 * @type {number}
		 */
		timing: 'none',

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
			this.data = (data !== undefined ? data : null);
			if (config) {
				if (config.duration !== undefined) {
					this.duration = config.duration;
				}
				if (config.timing !== undefined) {
					this.timing = config.timing;
				}
			}
		}

	}, {}, { // Static ...........................................................

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
			function step() {
				var value = 1;
				var time = timer.now();
				var progress = time - start;
				if (progress < tween.duration) {
					value = progress / tween.duration;
					if (tween.timing !== 'none') {
						value = value * 90 * Math.PI / 180;
						switch (tween.timing) {
							case 'ease-in':
								value = 1 - Math.cos(value);
								break;
							case 'ease-out':
								value = Math.sin(value);
								break;
						}
					}
				}
				/*
				if (value === 1) {
					tween.value = 1;
					tween.done = true;
				} else {
					tween.value = value;
					requestAnimationFrame(step);
				}
				*/
				tween.value = value;
				if (tween.value === 1) {
					tween.done = true;
				}
				gui.Broadcast.dispatch(gui.BROADCAST_TWEEN, tween);
				tween.init = false;
				if (!tween.done) {
					requestAnimationFrame(step);
				}
			}
			step(start);
			return tween;
		}

	});
}(gui.Arguments.confirmed, gui.Combo.chained));
