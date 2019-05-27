/**
 * Superb tag model.
 * @extends {ts.ui.Model}
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Type.isFunction} isFunction
 */
ts.ui.TagModel = (function using(chained, confirmed, isFunction, UNIT) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'tag',

		/**
		 * Type is really the CSS classname.
		 * @type {string}
		 */
		type: null,

		/**
		 * No default keyboard support,
		 * unless it has onclick or ondelete.
		 * @type {number}
		 */
		tabindex: -1,

		/**
		 * Tag icon or JSON representation of {ts.ui.UserImageModel|ts.ui.IconModel}.
		 * @type {string|object}
		 */
		icon: {
			getter: function() {
				return this._icon;
			},
			setter: confirmed('(string|object)')(function(icon) {
				if (typeof icon === 'object') {
					if (icon.item) {
						var ModelC;
						switch (icon.item) {
							case 'icon':
								ModelC = ts.ui.IconModel(icon);
								break;
							case 'userimage':
								icon.size = UNIT * 0.75; // fixed to the size of the tag
								ModelC = ts.ui.UserImageModel(icon);
								break;
							default:
								console.error('Unknown item: "' + icon.item + '" in ts.ui.Tag instance.');
								break;
						}
						this._icon = new ModelC(icon);
					} else {
						console.error('"icon.item" is not defined in ts.ui.Tag instance.');
						return;
					}
				} else {
					this._icon = icon;
				}
				this.$dirty();
			})
		},

		/**
		 * Something to execute onclick.
		 * @type {function}
		 */
		onclick: {
			getter: function() {
				return this._onclick;
			},
			setter: confirmed('(function)')(function(onclick) {
				this._onclick = onclick;
				this.clickable = isFunction(onclick);
				this.$dirty();
			})
		},

		/**
		 * Something to execute ondelete.
		 * @type {function}
		 */
		ondelete: {
			getter: function() {
				return this._ondelete;
			},
			setter: confirmed('(function)')(function(ondelete) {
				this._ondelete = ondelete;
				this.deletable = isFunction(ondelete);
				this.$dirty();
			})
		},

		/**
		 * Is the tag deletable?
		 * @type {boolean}
		 */
		deletable: false,

		/**
		 * Remove the html element when call delete
		 * @type {boolean}
		 */
		doremove: true,

		/**
		 * Is the tag clickable?
		 * @type {boolean}
		 */
		clickable: false,

		/**
		 * Data accessor
		 * @see this._data
		 * @type {Map}
		 */
		data: {
			getter: function() {
				if (!this._data) {
					this._data = new Map();
				} else if (typeof this._data === 'string') {
					this._data = new Map([[this._data]]);
				} else if (Array.isArray(this._data)) {
					this._data = new Map(this._data);
				}
				return this._data;
			},
			setter: confirmed('string|array|map')(function(data) {
				this._data = data;
				this.$dirty();
			})
		},

		/**
		 * Is the tag locked?
		 * @type {boolean}
		 */
		locked: false,

		/**
		 * Click that tag.
		 * @returns {ts.ui.TagModel}
		 */
		click: chained(function() {
			if (isFunction(this.onclick)) {
				setTimeout(
					function unfreeze() {
						this.onclick();
					}.bind(this),
					50
				);
			}
		}),

		/**
		 * Delete that tag.
		 * @returns {ts.ui.TagModel}
		 */
		delete: chained(function() {
			if (isFunction(this.ondelete)) {
				setTimeout(
					function unfreeze() {
						this.ondelete();
					}.bind(this),
					50
				);
			}
		}),

		/**
		 * Bounce model to HTML
		 * @returns {string}
		 */
		render: function() {
			return ts.ui.tag.edbml(this);
		},

		// Private .................................................................

		/**
		 * All the key and value sets
		 * @type {Map}
		 */
		_data: null,

		/**
		 * Tag icon.
		 * @type {string|ts.ui.UserImageModel}
		 * @private
		 */
		_icon: null,

		/**
		 * Open for implementation: Called when the user clicks tag.
		 * @type {Function}
		 * @private
		 */
		_onclick: null,
		/**
		 * Open for implementation: Called when the user clicks DEL on tag.
		 * @type {Function}
		 * @private
		 */
		_ondelete: null
	});
})(gui.Combo.chained, gui.Arguments.confirmed, gui.Type.isFunction, ts.ui.UNIT);
