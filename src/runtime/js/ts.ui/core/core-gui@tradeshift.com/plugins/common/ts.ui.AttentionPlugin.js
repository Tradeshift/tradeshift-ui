/**
 * Keyboard TAB attention trapping.
 * This is all *disabled* on mobile.
 * @using {gui.Array} GuiArray
 * @using {gui.Combo#chained} chained
 * @using {function} notontouch Setup to ignore focus stuff on touch device
 */
ts.ui.AttentionPlugin = (function using(GuiArray, chained, notontouch) {
	return ts.ui.Plugin.extend({
		/**
		 * Trapping the focus already?
		 * @type {Boolean}
		 */
		trapping: false,

		/**
		 * Cleanup on exit.
		 * TODO (jmo@): automate this step in Spiritual
		 */
		ondestruct: function() {
			this.super.ondestruct();
			if (this.trapping) {
				ts.ui.LayoutModel.output.get().attention.removeObserver(this);
				gui.Tick.cancelTime(this._timeout);
				this._listen(false);
			}
		},

		/**
		 * Trap attention inside the spiriti (or inside given target).
		 * @param @optional {Element|gui.Spirit} opt_elm
		 * @returns {ts.ui.AttentionPlugin}
		 */
		trap: chained(
			notontouch(function(opt_elm) {
				var elm = this._getelement(opt_elm);
				if (!this.trapping) {
					this.trapping = true;
					this._listen(true);
					this._trap(elm);
				}
			})
		),

		/**
		 * Forcibly focus the first focusable thing.
		 * We assume that forms are most important.
		 * @param @optional {Element} elm
		 * @returns {boolean} True when something was focused
		 */
		enter: notontouch(function(opt_elm) {
			var hit = null;
			var elm = this._getelement(opt_elm);
			var all = GuiArray.from(elm.getElementsByTagName('*'));
			var that = this;
			function find(informs) {
				return all.reduce(function(result, next) {
					if (!result && that._isfocus(next, informs)) {
						result = next;
					}
					return result;
				}, null);
			}
			if ((hit = find(true) || find(false))) {
				hit.focus();
			}
			return hit !== null;
		}),

		/**
		 * Forcibly exit the attention zone. Might move focus to another zone.
		 * @param @optional {Element|gui.Spirit} opt_elm
		 * @returns {ts.ui.AttentionPlugin}
		 */
		exit: function(opt_elm) {
			if (this._entered) {
				var elm = this._getelement(opt_elm);
				var dom = gui.DOMPlugin;
				var act = document.activeElement;
				var def = act === document.body;
				if (act && !act.nodeType) {
					act = null; // IE11 may miserably report activeElement as an array :/
				}
				if (def && act) {
					act.blur();
				} else if (act) {
					if (act === elm || dom.contains(elm, act)) {
						act.blur();
					}
				}
				this._attention('exit');
			}
		},

		/**
		 * Something was focused or blurred.
		 * @param {Event} e
		 */
		handleEvent: function(e) {
			var elm = e.target;
			if (this._isfocus(elm)) {
				switch (e.type) {
					case 'focus':
						this._onfocus(elm);
						break;
					case 'blur':
						this._onblur(elm);
						break;
				}
			}
		},

		/**
		 * Handle broadcast.
		 * @param {gui.Broadcast} b
		 */
		onbroadcast: function(b) {
			if (b.type === ts.ui.BROADCAST_ATTENTION_MOVE) {
				if (b.data === this.spirit.$instanceid) {
					this.enter();
				}
			}
		},

		/**
		 * An `$instanceid` was popped from the attention queue. If we're now the
		 * last entry, we'll attempt to restore the focus to whatever had it.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			var list = ts.ui.LayoutModel.output.get().attention;
			var inst = this.spirit.$instanceid;
			var last = this._latest;
			if (last) {
				changes.forEach(function(change) {
					if (change.object === list) {
						if (change.removed.length) {
							if (list[list.length - 1] === inst) {
								this._restorefocus(last);
							}
						}
					}
				}, this);
			}
		},

		// Private .................................................................

		/**
		 * Timeout index.
		 * @type {number}
		 */
		_timeout: -1,

		/**
		 * Attention zone entered?
		 * @type {boolean}
		 */
		_entered: false,

		/**
		 * Hard reference to last focused element.
		 * @type {HTMLElement}
		 */
		_latest: null,

		/**
		 * Get element for argument, default to spirit element.
		 * @param @optional {element|ts.ui.Spirit} elm
		 */
		_getelement: function(elm) {
			elm = elm || this.spirit.element;
			return elm.nodeType ? elm : elm.element;
		},

		/**
		 * Insert focusable KBD before and after element. Whenever the
		 * KBDs receive the focus, we'll relocate focus another element.
		 * TODO (jmo@): What if someone moves the element to elsewhere?
		 * @param {HTMLElement} elm
		 */
		_trap: function(elm) {
			[true, false]
				.map(function(before) {
					return elm.parentNode.insertBefore(
						document.createElement('kbd'),
						before ? elm : elm.nextElementSibling
					);
				})
				.forEach(function(kbd, last) {
					kbd.tabIndex = 0;
					kbd.onfocus = function() {
						this._tryfocus(elm, !last);
					}.bind(this);
				}, this);
		},

		/**
		 * @param {Element} elm
		 * @param {boolean} last
		 * @returns {boolean} True when something was focused
		 */
		_tryfocus: function(elm, reverse) {
			var did = false,
				elms = elm.getElementsByTagName('*');
			if ((elms = GuiArray.from(elms)).length) {
				elms = reverse ? elms.reverse() : elms;
				did = this._didfocus(
					elms.filter(function(elem) {
						return elem.tabIndex > -1 && !elem.disabled;
					})
				);
			}
			return did;
		},

		/**
		 * Focus the first focusbable thing in that list.
		 * @param {Array<HTMLElement>} elms
		 */
		_didfocus: function(elms) {
			return elms.every(function(elm) {
				if (this._isfocus(elm)) {
					return !this._dofocus(elm);
				}
				return true;
			}, this);
		},

		/**
		 * Attempt to focus that element and report any sucess (this is
		 * cheaper than computing all `display` and `visiblity` up front).
		 * @returns {boolean} True on succesfully focused
		 */
		_dofocus: function(elm) {
			elm.focus(); // TODO(jmo@): could this break IE when focus fails?
			return document.activeElement === elm;
		},

		/**
		 * Element is focusable form control or link? Note that form
		 * elements can be given a higher priority than other elements.
		 * @param {Element} elm
		 * @param {boolan} forms Looking for form fields only?
		 * @returns {boolean}
		 */
		_isfocus: function(elm, forms) {
			if (forms || arguments.length === 1) {
				switch (elm.localName) {
					case 'input':
					case 'textarea':
					case 'select':
						return elm.type !== 'hidden' && !elm.readonly && !elm.disabled;
				}
			}
			if (!forms) {
				switch (elm.localName) {
					case 'button':
					case 'a':
						return !elm.disabled;
				}
				if (elm.tabIndex > -1) {
					// in IE9/IE10 it appears *everything* has tabIndex zero ...
					if (elm.hasAttribute('tabindex')) {
						// so we'll make extra sure!
						return true;
					}
				}
			}
			return false;
		},

		/**
		 * Listen and unlisten for all sorts of stuff going on.
		 * @TODO use focusin and focusout for IE/Opera?
		 * @param {boolean} listen
		 */
		_listen: function(listen) {
			var element = this.spirit.element;
			var action1 = listen ? 'addEventListener' : 'removeEventListener';
			var action2 = listen ? 'addGlobal' : 'removeGlobal';
			element[action1]('focus', this, true);
			element[action1]('blur', this, true);
			gui.Broadcast[action2](ts.ui.BROADCAST_ATTENTION_MOVE, this);
		},

		/**
		 * Something was focused.
		 * @param {Element} elm
		 */
		_onfocus: function(elm) {
			clearTimeout(this._timeout);
			this._focused = true;
			this._latest = elm;
			if (!this._entered) {
				// trap just entered?
				this._entered = true;
				this._attention('enter');
			}
		},

		/**
		 * Something was blurred. If nothing new gets focused soon, we determine
		 * that an exit was performed. Not that this doesn't move to focus back
		 * to any previous zone, you must invoke a manual 'exit()' for this
		 */
		_onblur: function() {
			this._focused = false;
			this._timeout = gui.Tick.time(
				function() {
					if (!this._focused) {
						this._entered = false;
					}
				},
				0,
				this
			);
		},

		/**
		 * @param {Element} last
		 */
		_restorefocus: function(last) {
			gui.Tick.time(function() {
				var act = document.activeElement;
				if (act && (act === document.body || act.tabIndex === -1)) {
					if (gui.DOMPlugin.embedded(last)) {
						last.focus();
					}
				}
			});
		},

		/**
		 * Update attention list.
		 * @param {String} scenario
		 * In order to fix the bug: it doesn't focus the right button when multiple asides were closed
		 * So disable the code if (last === inst)
		 */
		_attention: function(scenario) {
			var inst = this.spirit.$instanceid;
			var modl = ts.ui.LayoutModel.output.get();
			var list = modl.attention;
			var last = list[list.length - 1];
			switch (scenario) {
				case 'enter':
					if (last !== inst) {
						list.push(inst);
						list.addObserver(this);
					}
					break;
				case 'exit':
					if (list.length) {
						// if (last === inst) {
						list.removeObserver(this);
						list.pop();
						// }
					}
					break;
			}
		}
	});
})(gui.Array, gui.Combo.chained, function notontouch(base) {
	return function() {
		if (!gui.Client.isTouchDevice) {
			return base.apply(this, arguments);
		}
	};
});
