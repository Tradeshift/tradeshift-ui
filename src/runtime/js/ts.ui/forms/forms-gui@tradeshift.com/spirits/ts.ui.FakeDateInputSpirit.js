/**
 * Appears in the place of <input type="date"/>.
 * The original type="date" has too much browser-specific baggage, so we
 * replace it with a text input. This is that text input. The original date
 * input stays in the DOM, but is	hidden. That allows most bindings that
 * the user have used to keep working.
 * @extends {ts.ui.FakeInputSpirit}
 * @using {string} tick
 * @using {number} time
 */
ts.ui.FakeDateInputSpirit = (function using(chained, tick, time) {
	return ts.ui.FakeInputSpirit.extend({
		/**
		 * Attached the DOM.
		 */
		onattach: function() {
			this.super.onattach();
			this.css.add(ts.ui.CLASS_DATE);
		},

		/**
		 * Handle tick.
		 * @param {gui.Tick} t
		 */
		ontick: function(t) {
			this.super.ontick(t);
			if (!this._proxyspirit.$destructed) {
				if (t.type === tick) {
					this._syncfake();
				}
			}
		},

		/**
		 * Proxy spirit of the dateinput.
		 * @param {HTMLInputElement} input
		 */
		proxy: chained(function(input) {
			this.super.proxy(input);
			this.disabled = input.disabled;
			this._initialupdate();
		}),

		// Privileged ..............................................................

		/**
		 * Style the form.
		 */
		$updatestyling: function() {
			this.super.$updatestyling();
			this._label(function(label) {
				label.$datelabel();
			});
		},

		// Private .................................................................

		/**
		 * Spirit of the real <input type="date">.
		 * @type {ts.ui.DateInputSpirit}
		 */
		_proxyspirit: null,

		/**
		 * Initial update going on. When Angular is running somewhere on the page,
		 * it appears that Firefox needs a short break here for some weird reason.
		 * @param {HTMLSelectElement} select
		 */
		_initialupdate: function(select, again) {
			this._syncfake();
			this.tick.add(tick).start(tick, time);
		},

		/**
		 * Open that date picker.
		 * @param {function} onclosed
		 * TODO(jmo@): First update fake, then wait for animation, then update real.
		 */
		_openaside: function(onclosed) {
			var spirit = this,
				real = this._proxyspirit;
			var title = this._label(function(label) {
				return label.text();
			});
			ts.ui
				.DatePicker({
					title: title || ts.ui.String.LABEL_DATEPICK,
					value: real.value,
					min: real.min,
					max: real.max,
					onselect: function(value) {
						spirit._syncreal(value);
						spirit._syncfake();
						this.close();
					},
					onclosed: function() {
						onclosed.call(spirit);
						this.dispose();
					}
				})
				.open();
		},

		/**
		 * Assign value to the real input
		 * and dispatch an 'input' event.
		 */
		_syncreal: function(value) {
			var realspirit = this._proxyspirit;
			if (realspirit.value !== value) {
				realspirit.value = value;
				if (gui.Client.isExplorer) {
					this._triggerchange();
				} else {
					this._triggerinput();
				}
			}
		},

		/**
		 * Sync the fake input to the real input. Note that
		 * Copy the real date input placeholder to the fake one.
		 * this method is runs periodically on a {gui.Tick}.
		 * TODO(jmo@): Validate ISO format around here...
		 */
		_syncfake: function() {
			var realspirit = this._proxyspirit;
			if (realspirit.value !== this.value) {
				this.value = realspirit.value;
			}
			if (realspirit.element.placeholder !== this.element.placeholder) {
				this.element.placeholder = realspirit.element.placeholder;
			}
		}
	});
})(gui.Combo.chained, ts.ui.FieldSpirit.TICK_SYNC, ts.ui.FieldSpirit.TICK_TIME);
