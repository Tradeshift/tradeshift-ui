/**
 * Spirit of the label.
 * @extends {ts.ui.FormSupportSpirit}
 * @using {gui.Client} Client
 * @using {ts.ui.FieldSpirit} FieldSpirit
 * @using {gui.Combo.chained}
 * @using {string} tick
 * @using {number} time
 * @using {number} controlclass
 */
ts.ui.LabelSpirit = (function using(Client, FieldSpirit, chained, tick, time, controlclass) {
	var class_switchlabel = ts.ui.CLASS_SWITCHLABEL,
		class_fieldlabel = ts.ui.CLASS_FIELDLABEL,
		class_textlabel = ts.ui.CLASS_TEXTLABEL,
		class_datelabel = ts.ui.CLASS_DATELABEL,
		class_fakelabel = ts.ui.CLASS_FAKELABEL,
		class_customiconlabel = ts.ui.CLASS_CUSTOMICONLABEL,
		class_haslabel = ts.ui.CLASS_HASLABEL,
		class_disabled = ts.ui.CLASS_DISABLED,
		class_readonly = ts.ui.CLASS_READONLY,
		class_required = ts.ui.CLASS_REQUIRED,
		class_option = ts.ui.CLASS_OPTION,
		class_error = ts.ui.CLASS_ERROR,
		class_focus = ts.ui.CLASS_FOCUS,
		class_empty = ts.ui.CLASS_EMPTY;

	/**
	 * Under mysterious circumstances, the label will loose it's styling
	 * when running inside Angular templates. The only known workaround
	 * is to periodically check for missing classnames and reapply them.
	 * @param {ts.ui.FieldSpirit} field
	 */
	function updatestyling(field) {
		field.$updatestyling();
	}

	return ts.ui.FormSupportSpirit.extend({
		/**
		 * Setup for hotfix.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._persisted = [];
		},

		/**
		 * Attach to the DOM.
		 */
		onattach: function() {
			this.super.onattach();
			this.event.add('mousedown');
			this.event.add('focus blur', this, this, true);
			this.tick.add(tick).start(tick, time);
			this.css.add('ts-engine-' + Client.agent);
		},

		/**
		 * If the control class has not been applied, we'll ask all fields to
		 * refresh the styling. Fixes a (rare) glitch in Angular integration.
		 * @param {gui.Tick} t
		 */
		ontick: function(t) {
			this.super.ontick(t);
			if (t.type === tick) {
				this._refreshstyling();
			}
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			switch (e.type) {
				case 'focus':
				case 'blur':
					switch (e.target.type) {
						case 'radio':
							break;
						default:
							this._focus(e.type === 'focus');
							break;
					}
					break;
				case 'mousedown':
					var boxes = this.dom.qall('input[type=checkbox]');
					if (boxes.length) {
						boxes[0].focus();
						e.preventDefault();
					}
					break;
			}
		},

		/**
		 * Get the label text (what the user sees).
		 * @returns {string}
		 */
		text: function() {
			var span = this.dom.q('this > span');
			return span ? span.textContent.trim() : '';
		},

		// Private .................................................................

		/**
		 * @type {boolean}
		 */
		_disabled: false,

		/**
		 * Layout as options?
		 * @type {boolean}
		 */
		_option: false,

		/**
		 * Layout as focused?
		 * @param {boolean} is
		 */
		_focus: function(is) {
			this.css.shift(is, class_focus);
		},

		/**
		 * If the "control class" is lost, we'll assume that the
		 * (rare) Angular glitch has occured and reapply styling.
		 */
		_refreshstyling: function() {
			if (!this.css.contains(controlclass)) {
				this.dom.descendants(FieldSpirit).forEach(updatestyling);
			}
		},

		// Priveleged ..............................................................

		/**
		 * This is like a "control class" that all fields
		 * will attach. If we don't see this class, it's
		 * because Angular has done something terrible
		 * and we must react in a strong way.
		 */
		$fieldlabel: chained(function() {
			this.css.add(class_fieldlabel);
		}),

		/**
		 * Layout as invalid.
		 * @param {boolean} is
		 */
		$invalid: chained(function(is) {
			this.css.shift(is, class_error);
		}),

		/**
		 * Layout as text input label.
		 */
		$textlabel: chained(function() {
			this.css.add(class_textlabel);
		}),

		/**
		 * Layout as labeled field (versus unlabeled field).
		 */
		$haslabel: chained(function(has) {
			this.css.shift(has, class_haslabel);
		}),

		/**
		 * Layout as date input label.
		 */
		$datelabel: chained(function() {
			this.css.add(class_datelabel);
		}),

		/**
		 * Layout as (fake) selector label.
		 */
		$fakelabel: chained(function() {
			this.css.add(class_fakelabel);
		}),

		/**
		 * Is this a fake input's label?
		 */
		$isFakelabel: function() {
			return this.css.contains(class_fakelabel);
		},

		/**
		 * Use a custom icon instead of the automatically generated one
		 */
		$customicon: chained(function(customicon, hasCustomicon) {
			if (hasCustomicon) {
				var character = ts.ui.ICONS[customicon] || '';
				this.css.add(class_customiconlabel);
				this.att.set('data-ts-icon', character);
			} else {
				this.css.remove(class_customiconlabel);
				this.att.remove('data-ts-icon');
			}
		}),

		/**
		 * Layout as radio or checkbox label.
		 * @param {string} type 'radio' or 'checkbox'
		 */
		$option: chained(function(type) {
			this.css.add(class_option);
			this.css.add('ts-' + type);
		}),

		/**
		 * Layout as switch label.
		 */
		$switch: chained(function() {
			this.css.add(class_switchlabel);
		}),

		/**
		 * Field disabled? (also called when not disabled).
		 * @param {boolean} disabled
		 */
		$disabled: chained(function(disabled) {
			var change = this.css.contains(class_disabled) ? !disabled : disabled;
			if (change) {
				this.css.shift(disabled, class_disabled);
			}
		}),

		/**
		 * Field read only? (also called when not read only).
		 * @param {boolean} readonly
		 */
		$readonly: chained(function(readonly) {
			this.css.shift(readonly, class_readonly);
		}),

		/**
		 * Field required? (also called when not required).
		 * @param {boolean} readonly
		 */
		$required: chained(function(required) {
			var change = this.css.contains(class_required) ? !required : required;
			if (change) {
				this.css.shift(required, class_required);
			}
		}),

		/**
		 * Field empty.
		 * @param {boolean} empty
		 */
		$empty: chained(function(empty) {
			this.css.shift(empty, class_empty);
		})
	});
})(
	gui.Client,
	ts.ui.FieldSpirit,
	gui.Combo.chained,
	ts.ui.FieldSpirit.TICK_SYNC,
	ts.ui.FieldSpirit.TICK_TIME,
	ts.ui.CLASS_FIELDLABEL
);
