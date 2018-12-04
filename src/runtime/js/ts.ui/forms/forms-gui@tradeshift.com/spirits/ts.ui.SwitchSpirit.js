/**
 * REVISION OF THE SWITCH FOR ANGULAR 1.5, SEEMS IT BREAKS IN ANGULAR 1.3 THOUGH
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
		 * Attaching to the DOM.
		 */
		onattach: function() {
			this.super.onattach();
			this.event.add('change');
			this._createswitch();
			this._synchronize(true);
			this.tick.add(tick).start(tick, time);
			this.css.add([ts.ui.CLASS_SWITCHBOX, ts.ui.CLASS_ENGINE]);
		},

		/**
		 * Detaching from the DOM.
		 */
		ondetach: function() {
			this.super.ondetach();
			this.tick.remove(tick);
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
		 * Snapshot checked status so that we know when it changes.
		 * @type {boolean|null}
		 */
		_snapshot: null,

		/**
		 * Fetch the switch element (and potentially create it).
		 * @param {boolean} [create] - Create switch if it doesn't exist?
		 * @returns {HTMLDivElement}
		 */
		_switch: function(create) {
			if (create && !this._switch()) {
				return this._createswitch();
			} else {
				var elm = this.dom.following(ts.ui.Spirit)[0];
				return elm && elm.css.contains('ts-switcher') ? elm : null;
			}
		},

		/**
		 * Inject the switch. Let's remove any potential existing
		 * switch, accounting for strange Angular quantum effects.
		 * @returns {ts.ui.Spirit}
		 */
		_createswitch: function() {
			var html = ts.ui.switchonly.edbml();
			this._switch() ? this._switch().dom.remove() : void 0;
			return ts.ui.get(this.dom.after(this.dom.parseToNode(html)));
		},

		/**
		 * Match switch to checkbox. Note that we do
		 * this on an interval just to make sure...
		 * @param @optional {boolean} init Don't dispatch action on init
		 */
		_synchronize: function(init) {
			var checked = this.element.checked;
			if (init || checked !== this._snapshot) {
				this._switch(true).css.shift(checked, ts.ui.CLASS_CHECKED);
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
