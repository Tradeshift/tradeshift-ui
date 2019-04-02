/**
 * Spirit of the input type="date".
 * TODO(jmo@): Destruct fake input when this gets destructed.
 * TODO(jmo@): Move fake input when this gets moved?
 * @extends {ts.ui.InputSpirit}
 * @see http://stackoverflow.com/questions/7372038/
 *		 is-there-any-way-to-change-input-type-date-format
 */
ts.ui.DateInputSpirit = (function(tick, time) {
	var EMPTYVALUE = ''; // invalid dates will not be displayed

	return ts.ui.InputSpirit.extend({
		/**
		 * Min date.
		 * @type {string}
		 */
		min: null,

		/**
		 * Max date.
		 * @type {string}
		 */
		max: null,

		/**
		 * Configure much.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.att.add('min max');
		},

		/**
		 * Show the fake input. This (real) input is hidden via CSS in a
		 * way so that it can still be focused (so not via `display:none`).
		 */
		onready: function() {
			this.super.onready();
			this.tick.add(tick).start(tick, time);

			// Change the original input into a plain text field to suppress the native datepicker cross-browser.
			// If javascript is disabled for any reason, the browser will gracefully fallback to the native date picker
			this.element.type = 'text';

			this._createfake(ts.ui.FakeDateInputSpirit).proxy(this.element);
		},

		/**
		 * Handle tick.
		 * @param {gui.Tick} t
		 */
		ontick: function(t) {
			this.super.ontick(t);
			if (t.type === tick) {
				this._revaluate(this.element.value);
			}
		},

		/**
		 * Handle attribute update.
		 * TODO(jmo@): Validate min versus max versus (current) value
		 * @param {gui.Att} att
		 */
		onatt: function(att) {
			this.super.onatt(att);
			var value = att.value;
			switch (att.name) {
				case 'min':
					this.min = this._evaluated(value);
					break;
				case 'max':
					this.max = this._evaluated(value);
					break;
			}
		},

		// Private .................................................................

		/**
		 * Remember the good old value.
		 * @type {string}
		 */
		_snapshot: null,

		/**
		 * Now this is tricky: If this spirit happened to attach to an Angular
		 * template before Angular parsed the template, the temple will now
		 * contain the initialized markup including the {ts.ui.FakeDateInputSpirit}.
		 * In that case, we'll need to remove the old fake input first.
		 * @param {constructor} SelectInput
		 * @returns {ts.ui.FakeDateInputSpirit}
		 */
		_createfake: function(FakeInput) {
			var existing = this.dom.next(ts.ui.TextInputSpirit); // huh?
			if (existing) {
				existing.dom.remove();
			}
			return this.dom.after(FakeInput.summon());
		},

		/**
		 * There's no callback when input.value changes, so we'll check on a tick.
		 *
		 */
		_revaluate: function(newval) {
			var oldval = this._snapshot;
			if (newval !== EMPTYVALUE && newval !== oldval) {
				this._snapshot = newval;
				this.value = newval;
				// the value will be _evaluated() in method below
				// because {ts.ui.FieldSpirit#value} has a setter
			}
		},

		/**
		 * Evaluate that value. If bad value, warn user and return empty string.
		 * This emulates the behavior that occurs in browsers where native date
		 * inputs are supported (WebKit, but not Firefox) and in which this code,
		 * by the way, doesn't even get evaluated if the format is indeed invalid.
		 * @overwrites {ts.ui.FieldSpirit#_evaluated}
		 * @param {string} value
		 * @returns {string}
		 */
		_evaluated: function(value) {
			if (isNaN(new Date(value).getTime())) {
				console.warn(
					"The specified value '" +
						value +
						"' does not " +
						"conform to the required format, 'yyyy-MM-dd'."
				);
				return EMPTYVALUE;
			}
			return value;
		}
	});
})(ts.ui.FieldSpirit.TICK_SYNC, ts.ui.FieldSpirit.TICK_TIME);
