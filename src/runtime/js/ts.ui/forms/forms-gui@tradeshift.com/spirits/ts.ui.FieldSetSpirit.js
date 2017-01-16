/**
 * Spirit of fieldset.
 * @extends {ts.ui.Spirit}
 */
ts.ui.FieldSetSpirit = (function() {
	return ts.ui.Spirit.extend({

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
				case 'focusin' :
				case 'focusout' :
				case 'focus' :
				case 'blur' :
					switch (e.target.type) {
						case 'radio' :
							this._focus(e.type === 'focusin' || e.type === 'focus');
							break;
					}
					break;
				case 'mousedown' :
					if (this._focusradio() || this._focusbox()) {
						e.preventDefault();
					}
					break;
			}
		},

		// Privileged ..............................................................

		/**
		 * Layout as options group.
		 */
		$options: function() {
			this.css.add(ts.ui.CLASS_OPTIONS);
			this.css.shift(!this.dom.q('span + label'), 'ts-nolabel');
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
}());
