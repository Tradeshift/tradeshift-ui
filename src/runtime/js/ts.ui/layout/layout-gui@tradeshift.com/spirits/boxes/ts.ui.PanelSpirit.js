/**
 * Something that scrolls with a scrollbar.
 * @using {gui.Combo#chained} chained
 * @using {string} ACTION_ATTACH
 * @using {string} ACTION_DETACH
 * @using {string} ACTION_SHOW
 * @using {string} ACTION_HIDE
 */
ts.ui.PanelSpirit = (function using(
	chained,
	ACTION_ATTACH,
	ACTION_DETACH,
	ACTION_SHOW,
	ACTION_HIDE,
	ACTION_CLASS
) {
	return ts.ui.Spirit.extend({
		/**
		 * For when the panel is used to generate tabs.
		 * @type {string}
		 */
		label: null,

		/**
		 * For when the panel is used to generate tabs.
		 * @type {boolean}
		 */
		selected: false,

		/**
		 * For when the panel is used to generate tabs.
		 * @type {string} label
		 */
		icon: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onselect: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onunselect: null,

		/**
		 * Panel is visible?
		 * @type {boolean} visible
		 */
		visible: {
			getter: function() {
				return this.css.contains(ts.ui.CLASS_SELECTED);
			},
			setter: function(is) {
				this.css.shift(is, ts.ui.CLASS_SELECTED);
			}
		},

		/**
		 * Setup.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.action.add([ACTION_ATTACH, ACTION_SHOW, ACTION_HIDE, ACTION_CLASS]);
		},

		/**
		 * Attach.
		 */
		onattach: function() {
			this.super.onattach();
			this.action.dispatch(ACTION_ATTACH, this._isroot());
		},

		/**
		 * Detach.
		 */
		ondetach: function() {
			this.super.ondetach();
			this.action.dispatch(ACTION_DETACH, this._isroot());
		},

		/**
		 * Consume nested panel actions. When a request for root CSS
		 * update is found, we'll stamp the action with a pointer to
		 * this panel (so that root CSS always matches selected panel).
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			switch (a.type) {
				case ACTION_ATTACH:
				case ACTION_SHOW:
				case ACTION_HIDE:
					a.consume();
					break;
				case ACTION_CLASS:
					if (this._isroot()) {
						a.data.relatedPanel = this;
					}
					break;
				case ts.ui.ACTION_STATUSBAR_LEVEL:
					if (a.target.guilayout.outsideMain()) {
						// TODO: CSS FOR THIS!
						this.guilayout.gotolevel(a.data);
					}
					break;
			}
		},

		/**
		 * Show the panel.
		 * @returns {this}
		 */
		show: chained(function() {
			this.visible = true;
		}),

		/**
		 * Hide the panel.
		 * @returns {this}
		 */
		hide: chained(function() {
			this.visible = false;
		}),

		/**
		 * How high should the Panel be in order to *not* show the scrollbar?
		 * @returns {number}
		 */
		naturalHeight: function() {
			return this.element.scrollHeight;
		},

		/**
		 * Panel shows a scrollbar (assumeing `overflow` is `scroll` or `auto`)?
		 * @returns {boolean}
		 */
		hasOverflow: function() {
			return this.naturalHeight() > this.element.offsetHeight;
		},

		/**
		 * @deprecated
		 * Get the MainSpirit nested directly inside this panel, if it exists.
		 * @returns {ts.ui.MainSpirit}
		 */
		childMain: function() {
			return this.dom.child(ts.ui.MainSpirit);
		},

		/**
		 * @deprecated
		 * Get the MainSpirit found above this panel, if it exists.
		 * (using ancestor, not parent, because of MainContenSpirit).
		 * @returns {ts.ui.MainSpirit}
		 */
		parentMain: function() {
			return this.dom.ancestor(ts.ui.MainSpirit);
		},

		/**
		 *
		 */
		busy: chained(function() {
			this._cover().show();
		}),

		/**
		 *
		 */
		done: chained(function() {
			this._cover().hide();
		}),

		/**
		 * @param @optional {string} message
		 */
		spin: chained(function(message) {
			this._cover().spin(message);
			this.busy();
		}),

		/**
		 *
		 */
		stop: chained(function() {
			this._cover().stop();
			this.done();
		}),

		// Privileged ..............................................................

		/**
		 *
		 */
		$onselect: function() {
			if (!this.selected) {
				this.selected = true;
				switch (gui.Type.of(this.onselect)) {
					case 'function':
						this.onselect();
						break;
					case 'string':
						new Function(this.onselect).call(this);
						break;
				}
			}
		},

		/**
		 *
		 */
		$onunselect: function() {
			if (this.selected) {
				this.selected = false;
				switch (gui.Type.of(this.onunselect)) {
					case 'function':
						this.onunselect();
						break;
					case 'string':
						new Function(this.onunselect).call(this);
						break;
				}
			}
		},

		// Private .................................................................

		/**
		 * @returns {ts.ui.CoverSpirit}
		 */
		_cover: function() {
			var Cover = ts.ui.CoverSpirit;
			return this.dom.child(Cover) || this.dom.append(Cover.summon());
		},

		/**
		 * Is root level panel?
		 * @returns {boolean}
		 */
		_isroot: function() {
			return this.dom.parent() === document.body;
		}
	});
})(
	gui.Combo.chained,
	ts.ui.ACTION_PANEL_ATTACH,
	ts.ui.ACTION_PANEL_DETACH,
	ts.ui.ACTION_PANEL_SHOW,
	ts.ui.ACTION_PANEL_HIDE,
	ts.ui.ACTION_ROOT_CLASSNAMES
);
