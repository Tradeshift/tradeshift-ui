/**
 * Update attributes. Except for the ID which
 * is required to be the same before and after.
 * @using {gui.CSSPlugin} CSSPlugin
 */
edbml.AttsUpdate = (function using(CSSPlugin) {
	return edbml.Update.extend({
		/**
		 * Update type.
		 * @type {String}
		 */
		type: edbml.Update.TYPE_ATTS,

		/**
		 * Setup update.
		 * @param {String} id
		 * @param {Element} xnew
		 * @param {Element} xold
		 * @returns {edbml.AttsUpdate}
		 */
		onconstruct: function(id, xnew, xold) {
			this.super.onconstruct();
			this.id = id;
			this._xnew = xnew;
			this._xold = xold;
		},

		/**
		 * Update attributes.
		 */
		update: function() {
			this.super.update();
			this.element(function(element) {
				if (this._beforeUpdate(element)) {
					this._update(element);
					this._afterUpdate(element);
					this._report();
				}
			});
		},

		/**
		 * Better not keep a reference to any DOM element around here.
		 * @overrides {edbml.Update#dispose}
		 */
		dispose: function() {
			this.super.dispose();
			delete this._xold;
			delete this._xnew;
		},

		// Private .................................................................

		/**
		 * (XML) element before update.
		 * @type {Element}
		 */
		_xold: null,

		/**
		 * (XML) element after update.
		 * @type {Element}
		 */
		_xnew: null,

		/**
		 * Actually update attributes.
		 * 1. Create and update attributes.
		 * 2. Remove attributes
		 * @param {HTMLElement} element
		 */
		_update: function(element) {
			Array.forEach(
				this._xnew.attributes,
				function(newatt) {
					var oldatt = this._xold.getAttribute(newatt.name);
					if (oldatt === null || oldatt !== newatt.value) {
						if (newatt.name === 'class') {
							this._classlist(element, this._xold, newatt.value);
						} else {
							this._set(element, newatt.name, newatt.value);
						}
						this._summary.push(
							'@' +
								newatt.name +
								'="' +
								newatt.value +
								'"' +
								(element.id ? ' (#' + element.id + ')' : '')
						);
					}
				},
				this
			);
			Array.forEach(
				this._xold.attributes,
				function(oldatt) {
					if (!this._xnew.hasAttribute(oldatt.name)) {
						if (oldatt.name === 'class') {
							this._classlist(element, this._xold, '');
						} else {
							this._del(element, oldatt.name, null);
						}
						this._summary.push(
							'removed @' + oldatt.name + (element.id ? ' (#' + element.id + ')' : '')
						);
					}
				},
				this
			);
		},

		/**
		 * Set element attribute.
		 * @param {Element} element
		 * @param {String} name
		 * @param {String} value
		 * @return
		 */
		_set: function(element, name, value) {
			var spirit = element.spirit;
			if (spirit) {
				spirit.att.set(name, value);
			} else {
				element.setAttribute(name, value);
				switch (name) {
					case 'checked':
						if (!element.checked) {
							element.checked = true;
						}
						break;
					case 'value':
						if (element.value !== value) {
							element.value = String(value); // ?
						}
						break;
				}
			}
		},

		/**
		 * Set element attribute.
		 * @param {Element} element
		 * @param {String} name
		 * @param {String} value
		 * @return
		 */
		_del: function(element, name) {
			var spirit = element.spirit;
			if (spirit) {
				spirit.att.del(name);
			} else {
				switch (name) {
					case 'checked':
						element.checked = false;
						break;
					default:
						element.removeAttribute(name);
						break;
				}
			}
		},

		/**
		 * Maintain the class attribute non-destructively
		 * so that outside agencies may contribute to it.
		 * @param {Element} element The actual DOM
		 * @param {Element} xelement The virtual DOM
		 * @param {string} classname
		 */
		_classlist: function(element, xelement, classname) {
			var newnames = classname.split(' ');
			var oldnames = xelement.className.split(' ');
			oldnames.forEach(function(oldname) {
				if (oldname && newnames.indexOf(oldname) === -1) {
					CSSPlugin.remove(element, oldname);
				}
			});
			newnames.forEach(function(newname) {
				if (newname && oldnames.indexOf(newname) === -1) {
					CSSPlugin.add(element, newname);
				}
			});
		},

		/**
		 * Debug changes.
		 */
		_report: function() {
			var summary = this._summary.join(', ');
			var message = 'edbml.AttsUpdate "#' + this.id + '" ' + summary;
			this.super._report(message);
		}
	});
})(gui.CSSPlugin);
