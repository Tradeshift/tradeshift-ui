/**
 * Spirit of fieldset.
 * @extends {ts.ui.FormSupportSpirit}
 */
ts.ui.FieldSetSpirit = (function() {
	return ts.ui.FormSupportSpirit.extend({
		/**
		 * Attach to the DOM.
		 */
		onattach: function() {
			this.super.onattach();
			this.event.add('mousedown');
			this.event.add('focus blur', this.element, this, true);
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			switch (e.type) {
				case 'focusin':
				case 'focusout':
				case 'focus':
				case 'blur':
					switch (e.target.type) {
						case 'radio':
							this._focus(e.type === 'focusin' || e.type === 'focus');
							break;
					}
					break;
				case 'mousedown':
					if (this._focusradio() || this._focusbox()) {
						e.preventDefault();
					}
					break;
			}
		},

		onasync: function() {
			this.super.onasync();
			var form = this.dom.parent(ts.ui.FormSpirit);
			if (form && form.css.contains(ts.ui.CLASS_PREVIEW)) {
				this.element.setAttribute('disabled', 'disabled');
				var fieldEl = this.element.querySelector('.' + ts.ui.CLASS_FIELD);
				if (fieldEl) {
					fieldEl.setAttribute('readonly', 'readonly');
				}
			}
		},

		// Privileged ..............................................................

		/**
		 * Layout as options group.
		 * @param {string} type 'radio' or 'checkbox'
		 */
		$options: function(type) {
			this.css.add(ts.ui.CLASS_OPTIONS).add('ts-' + type);
		},

		/**
		 * Mark as disabled (radio group scenario).
		 */
		$disabled: function(disabled) {
			this.css.shift(disabled, 'ts-disabled');
		},

		/**
		 * Layout as labeled fieldset (versus unlabeled fieldset).
		 * @param {boolean} has
		 */
		$haslabel: function(has) {
			this.css.shift(has, ts.ui.CLASS_HASLABEL);
		},

		// Private .................................................................

		/**
		 * Can we focus a radio button?
		 * @return {boolan}
		 */
		_focusradio: function() {
			var radio = this.dom.q('input[type=radio]');
			if (radio) {
				radio.focus();
				return true;
			}
			return false;
		},

		/**
		 * Can we focus a checkbox?
		 * @return {boolan}
		 */
		_focusbox: function() {
			var box = this.dom.q('input[type=checkbox]');
			if (box && !this.dom.q('.' + ts.ui.CLASS_FOCUS)) {
				box.focus();
				return true;
			}
			return false;
		},

		/**
		 * Layout as focused?
		 * @param {boolea} is
		 */
		_focus: function(is) {
			this.css.shift(is, ts.ui.CLASS_FOCUS);
		}
	});
})();
