/**
 * Spirit of the switch.
 * TODO (jmo@): Support swipe gestures on that switch!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * @extends {ts.ui.FieldSpirit}
 * @using {string} tick
 * @using {string} time
 */
ts.ui.SwitchSpirit = (function using(tick, time) {
	return ts.ui.FieldSpirit.extend({
		/**
		 * Setup the stuff.
		 */
		onenter: function() {
			this.super.onenter();
			this._confirmbasic(this.element.localName, this.element.type);
		},

		/**
		 * Attach to the DOM.
		 */
		onattach: function() {
			this.super.onattach();
			this.event.add('change');
			this.css.add([
				// TODO: update these classnames what with the new stylee!
				ts.ui.CLASS_SWITCHBOX,
				ts.ui.CLASS_ENGINE
			]);
			this._switch = this._createswitch();
			this._synchronize(true);
		},

		/**
		 * Syncrhonize on an interval so that we don't have to anticipate
		 * all the strange stuff that Angular might do with our elements.
		 */
		onready: function() {
			this.super.onready();
			this.tick.add(tick).start(tick, time);
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			switch (e.type) {
				case 'change':
					this._synchronize();
					break;
			}
		},

		/**
		 * Handle tick.
		 * @param {gui.Tick} t
		 */
		ontick: function(t) {
			this.super.ontick(t);
			if (t.type === tick) {
				this._synchronize();
			}
		},

		// Privileged ..............................................................

		/**
		 * Style the containing form elements.
		 */
		$updatestyling: function() {
			this.super.$updatestyling();
			this._label(function(label) {
				label.$switch();
			});
			this._fieldset(function(fieldset) {
				fieldset.$options();
			});
		},

		// Private .................................................................

		/**
		 * The switch DHTML thing.
		 * @type {HTMLDivElement}
		 */
		_switch: null,

		/**
		 * Snapshot checked status so that we know when it changes.
		 * @type {boolean|null}
		 */
		_snapshot: null,

		/**
		 * Inject the switch while accounting for strange Angular quantum effects.
		 * @returns {ts.ui.Spirit}
		 */
		_createswitch: function() {
			var oldswitch = this.dom.following(ts.ui.Spirit)[0];
			if (oldswitch && oldswitch.css.contains('ts-switcher')) {
				oldswitch.dom.remove();
			}
			return ts.ui.get(this.dom.after(this.dom.parseToNode(ts.ui.switchonly.edbml())));
		},

		/**
		 * Match switch to checkbox. Note that we do
		 * this on an interval just to make sure...
		 * @param @optional {boolean} init Don't dispatch action on init
		 */
		_synchronize: function(init) {
			var checked = this.element.checked;
			if (init || checked !== this._snapshot) {
				this._switch.css.shift(checked, ts.ui.CLASS_CHECKED);
				this._snapshot = checked;
				if (!init) {
					this.action.dispatch(ts.ui.ACTION_SWITCH, checked);
				}
			}
		},

		/**
		 * Confirm that you're not doing it wrong.
		 * TODO: handle this via some advanced superclass boilerplate.
		 */
		_confirmbasic: function(name, type) {
			var elm = this.element;
			if (gui.debug) {
				if (name !== 'input') {
					throw new Error(this + ' must attach to an input field', elm);
				} else if (type !== 'checkbox' && type !== 'radio') {
					throw new Error(this + ' must attach to a checkbox or radio', elm);
				}
			}
		}
	});
})(ts.ui.FieldSpirit.TICK_SYNC, ts.ui.FieldSpirit.TICK_TIME);
