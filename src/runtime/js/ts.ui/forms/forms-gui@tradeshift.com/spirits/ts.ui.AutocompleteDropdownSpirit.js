/**
 * Spirit of the autocomplete.
 */
ts.ui.AutocompleteDropdownSpirit = (function using(Client) {
	var CLASS_RESULTS_ITEM = 'ts-autocomplete-results';
	var CLASS_ITEM_SELECTED = 'ts-autocomplete-selected';

	var KeyCodes = {
		TAB: 9,
		ENTER: 13,
		ESC: 27,
		UP: 38,
		DOWN: 40,

		/**
		 *
		 * @param e {DOMEvent}
		 * @returns {Number}
		 */
		getKeyCode: function(e) {
			return window.event ? event.keyCode : e.keyCode ? e.keyCode : e.which;
		}
	};

	function getLocale() {
		return ts.ui.Autocomplete.localize();
	}

	return ts.ui.Spirit.extend(
		{
			/**
			 * Should we show the dropdown?
			 * @type {Boolean}
			 */
			_isActive: false,

			// Proxying from another input field here ..................................

			/**
			 * Bind to all important events of the original input fields
			 * @param {HTMLElement} element
			 */
			proxy: function(element) {
				this._proxyelement = element;
				this._proxyspirit = ts.ui.get(element);
				['keyup', 'keydown', 'focus', 'input', 'blur', 'change'].forEach(function(event) {
					this.event.add(event, element, this);
				}, this);
			},

			/**
			 * Load list of all possible items
			 * @type {Array.<{key: String, value: String}>}
			 */
			data: function(d) {
				this._model.autocompleteList = d;
			},

			onfilter: function(f) {
				this._model.onfilter = f;
			},

			onselect: function(f) {
				this._model.onselect = f;
			},

			// Lifecycle ...............................................................

			/**
			 * Create the model.
			 */
			onconstruct: function() {
				this.super.onconstruct();
				this._model = new ts.ui.AutocompleteDropdownModel();
				this._locale = getLocale();
			},

			/**
			 * Render the EDBML
			 */
			onenter: function() {
				this.super.onenter();
				this.script.load(ts.ui.AutocompleteDropdownSpirit.edbml);
				this.script.input(this._model);
			},

			/**
			 * Clean up potential memory leaks
			 */
			ondestuct: function() {
				this.super.prototype.ondestruct();
				delete this._model.autocompleteList;
				delete this._model.filteredAutocompleteList;
				this._model.dispose();
			},

			// Events ..................................................................

			/**
			 * Call the on`eventname` fn's from the spirit
			 * @param e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				var events = ['keyup', 'keydown', 'focus', 'input', 'blur'];

				if (events.indexOf(e.type) > -1) {
					this['on' + e.type](e);
				}
			},

			/**
			 * Handle up/down/enter/tab keys
			 */
			onkeydown: function(e) {
				var autocompleteElem = this._getelem();
				if (!autocompleteElem) {
					return;
				}
				var selectedElem = this._getselected();
				var keyCode = KeyCodes.getKeyCode(e);
				if (keyCode === KeyCodes.UP && selectedElem !== autocompleteElem.firstChild) {
					this._select('previous');
				} else if (keyCode === KeyCodes.DOWN && selectedElem !== autocompleteElem.lastChild) {
					this._select('next');
				} else if (keyCode === KeyCodes.ENTER) {
					if (selectedElem.className.indexOf(CLASS_RESULTS_ITEM) === -1) {
						this._selectelem(selectedElem);
						autocompleteElem.scrollTop = 0;
						this._render();
					}
				} else if (keyCode === KeyCodes.TAB || keyCode === KeyCodes.ESC) {
					this.onblur(null, true);
				}

				if (keyCode === KeyCodes.UP || keyCode === KeyCodes.DOWN || keyCode === KeyCodes.ENTER) {
					e.preventDefault();
				}
			},

			/**
			 * Capture esc/up/down keyup before they get to the input field
			 */
			onkeyup: function(e) {
				if (this._getelem() && this._isActive && this._model.filteredAutocompleteList.length) {
					var keyCode = KeyCodes.getKeyCode(e);
					if (keyCode === KeyCodes.ESC || keyCode === KeyCodes.UP || keyCode === KeyCodes.DOWN) {
						e.stopPropagation();
					}
				}
			},

			/**
			 * On focus, activate the field and filter
			 */
			onfocus: function() {
				this._isActive = true;
				this._render();
			},

			/**
			 * When typing, render filter results
			 */
			oninput: function() {
				this.onfocus();
			},

			/**
			 * On blur, hide the field
			 * isNow should be false, when clicking on the field because the focus
			 * would be lost from the input before the click event can capture the
			 * item being clicked.
			 * @param e
			 * @param {boolean} isNow should we hide it now, or in a few milliseconds?
			 */
			onblur: function(e, isNow) {
				var onblurAction = function() {
					this._isActive = false;
					this.script.run();
				}.bind(this);

				if (isNow) {
					onblurAction();
				} else {
					this.tick.time(onblurAction, Client.isExplorer ? 300 : 100);
				}
			},

			// Private .................................................................

			/**
			 * Get the autocomplete dropdown element
			 * @returns {HTMLElement} div
			 * @private
			 */
			_getelem: function() {
				return document.getElementById(this._model.$instanceid + '-list');
			},

			/**
			 * Get selected element
			 * @returns {HTMLElement} li
			 * @private
			 */
			_getselected: function() {
				return this._getelem().querySelector('.' + CLASS_ITEM_SELECTED);
			},

			/**
			 * Scroll the suggestion dropdown so that the elem appears as the first item
			 * @param {HTMLElement} elem
			 */
			_scroll: function(elem) {
				if (elem) {
					var elemRect = elem.getBoundingClientRect();
					var elemHeight = elemRect.bottom - elemRect.top;
					var elemSiblings = elem.parentNode.childNodes;
					for (var elemIdx = 0; elemIdx < elemSiblings.length; elemIdx++) {
						if (elemSiblings[elemIdx] === elem) {
							this._getelem().scrollTop = elemIdx * elemHeight;
							return;
						}
					}
				}
			},

			/**
			 * Select previous or next sibling and scroll the autocomplete to it
			 * @param direction 'previous' or 'next'
			 * @private
			 */
			_select: function(direction) {
				var selectedElem = this._getselected();
				this._unselect();
				selectedElem = selectedElem[direction + 'Sibling'];
				selectedElem.className += ' ' + CLASS_ITEM_SELECTED;
				this._scroll(selectedElem);
			},

			/**
			 * Remove selection from all items
			 * @private
			 */
			_unselect: function() {
				var childrenItems = this._getelem().children;
				if (childrenItems.length > 1) {
					for (var i = 0; i < childrenItems.length; i++) {
						childrenItems[i].className = childrenItems[i].className.replace(
							CLASS_ITEM_SELECTED,
							''
						);
					}
				}
			},

			/**
			 * Select DOM Element and parse the value from it
			 * @param {HTMLElement} elem
			 * @private
			 */
			_selectelem: function(elem) {
				var item = {
					key: '',
					value: ''
				};
				try {
					item = JSON.parse(elem.getAttribute('data-item'));
				} catch (e) {
					console.warn('Invalid JSON item!', e);
				}
				this._onselect(item, false);
			},

			/**
			 * Call the model's onselect and blur the field if necessary
			 * @param {Object} item
			 * @param {boolean} noBlur if true, the field won't blur
			 * @private
			 */
			_onselect: function(item, noBlur) {
				this._proxyelement.value = this._model.onselect(item);
				if (!noBlur) {
					this.onblur(null, true);
				}
			},

			/**
			 * Filter results and render the list
			 * Also select the first item in the list when searching and scroll to it
			 * @TODO @dsp maybe debounce the filtering
			 * @private
			 */
			_render: function() {
				var filter = this._proxyelement.value;

				if (this._model.onfilter) {
					this._model.filteredAutocompleteList = this._model.onfilter(filter);
				} else {
					this._model.filteredAutocompleteList = [];
				}

				this.script.run(this._locale.matchString);
				var autocompleteElem = this._getelem();
				if (autocompleteElem !== null) {
					var autocompleteListLength = this._model.filteredAutocompleteList.length;

					if (autocompleteListLength > 0) {
						// Always select the first item in the list
						autocompleteElem.firstChild.className += ' ' + CLASS_ITEM_SELECTED;
					}
					this._scroll(autocompleteElem.firstChild);
				}
			}
		},
		{
			// Static ...............................................................
			summon: function() {
				return this.possess(document.createElement('div'));
			}
		}
	);
})(gui.Client);
