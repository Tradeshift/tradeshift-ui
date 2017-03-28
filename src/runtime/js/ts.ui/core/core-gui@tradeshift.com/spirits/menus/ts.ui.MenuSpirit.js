
/**
 * Spirit of the menu.
 * @using {gui.Type} Type
 * @using {ts.ui.ButtonSpirit} ButtonSpirit
 */
ts.ui.MenuSpirit = (function using(Type, ButtonSpirit) {
	return ts.ui.Spirit.extend({

		/**
		 * Get ready.
		 */
		onready: function() {
			this.super.onready();
			if (!gui.Client.isTouchDevice) {
				this.event.add('focus blur', this, this, true);
			}
			if (this._ismodelled()) {
				this.event.add('click');
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
					this.event.add('keydown', document);
					break;
				case 'blur':
					this.event.remove('keydown', document);
					break;
				case 'keydown':
					this._onkey(e);
					break;
				case 'click':
					if (this._ismodelled()) {
						this._onclick(e.target);
					}
					break;
			}
		},

		// Private ...................................................................

		/**
		 * Optional MenuModel.
		 * @type {ts.ui.MenuModel}
		 */
		_model: null,

		/**
		 * @param {KeyEvent} e
		 */
		_onkey: function(e) {
			var button = document.activeElement;
			switch (e.keyCode) {
				case 38:
				case 40:
					var item = button.parentNode;
					this._movefocus(item, e.keyCode === 40);
					e.preventDefault(); // don't scroll!
					break;
				case 13:
					if (this._ismodelled()) {
						this._onclick(button);
					}
					break;
			}
		},

		/**
		 * Menu was clicked. If it was generated by a model,
		 * it's up to us to handle the toggling of items.
		 * @param {Element} elm
		 */
		_onclick: function(elm) {
			var button = ButtonSpirit.getButton(elm);
			if (button && button.disabled) {
				return;
			}
			if (this._ismodelled()) {
				var item = elm, model = this._model;
				while (item && item.localName !== 'li') {
					item = item.parentNode;
				}
				if (item) {
					this._toggle(model, this._indexOf(item));
				}
			}
		},

		/**
		 * Unknown to many, the item index can be extracted from the ID attribute.
		 * This is only the case for menus that are rendered via models, of course.
		 * We could of course count the ordinal index of the element, but we might
		 * like to hide items that are not visible, so this is more solid.
		 * @param {HTMLLiElement} item
		 * @returns {number}
		 */
		_indexOf: function(item) {
			var index = item.id.split('-')[1];
			if (Type.isDefined(index)) {
				return Type.cast(index);
			} else {
				console.error('That ID was used for something');
			}
		},

		/**
		 * Toggle selected index in model.
		 * @param {ts.ui.MenuModel} model
		 * @param {number} index
		 */
		_toggle: function(model, index) {
			var current, idx;
			switch (model.select) {
				case 'one':
					if (model.selectedIndex === index && this._hasplaceholder(model)) {
						model.selectedIndex = 0;
					} else {
						model.selectedIndex = index;
					}
					break;
				case 'many':
					current = model.selectedIndexes;
					if ((idx = current.indexOf(index)) > -1) {
						gui.Array.remove(current, idx);
					} else {
						current.push(index);
						current.sort(function(a, b) {
							return a - b;
						});
					}
					break;
			}
		},

		/**
		 * Forms `select` scenario: First item has no label, indicating
		 * that the associated select element should show a placeholder?
		 * @param {ts.ui.MenuModel} model
		 */
		_hasplaceholder: function(model) {
			return model.items.length && !model.items[0].label;
		},

		/**
		 * Move the focus inside the menu (use regular TAB to navigate out).
		 * @param {Element} source
		 * @param {boolean} down
		 */
		_movefocus: function(source, down) {
			var target, button, elm = this.element;
			if (source && source.localName === 'li') {
				if (down) {
					target = source.nextElementSibling ||
						elm.querySelector('li:first-child');
				} else {
					target = source.previousElementSibling ||
						elm.querySelector('li:last-child');
				}
				if (target && (button = target.querySelector('button, a'))) {
					button.focus();
				}
			}
		}

	}, { // Privileged static ......................................................

		/**
		 * Compute max items to fit on screen (or optionally inside the
		 * given container) for some kind of performance optimization.
		 * @param @optional {Element} opt_elm Container element
		 * @returns {number} Returns the number of items to show
		 */
		$maxItemsCount: function(opt_elm) {
			var itemh = 44; // HARDCODE ALERT
			var total = opt_elm ? opt_elm.offsetHeight : window.innerHeight;
			var avail = total / itemh;
			return Math.ceil(avail);
		}

	});
}(gui.Type, ts.ui.ButtonSpirit));
