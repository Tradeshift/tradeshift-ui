/**
 * Advanced aside model.
 * @extends {ts.ui.Model}
 * @param {function} chained
 */
ts.ui.AsideModel = (function using(chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'aside',

		/**
		 * Content collection.
		 * @type {ts.ui.Collection<ts.ui.Model>}
		 */
		items: ts.ui.Collection,

		/**
		 * Optional ID for any associated AsideSpirit.
		 * @type {string}
		 */
		id: null,

		/**
		 * Aside title.
		 * @type {String}
		 */
		title: null,

		/**
		 * Aside Note.
		 * @type {String}
		 */
		note: '',

		/**
		 * Current aside status (for xframe synchronization).
		 * Matches one of onopen|onopened|onclose|onclosed
		 * @type {string}
		 */
		status: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onopen: null,

		/**
		 * Open for implementation. Related to some kind
		 * of performance hack, not really a public fact.
		 * @type {function}
		 */
		onbeforeopened: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 * @returns {gui.Then} (some performance hack here)
		 */
		onopened: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onclose: null,

		/**
		 * Open for implementation.
		 * @type {function}
		 */
		onclosed: null,

		/**
		 * @type {boolean}
		 */
		isOpen: false,

		/**
		 * @type {string}
		 */
		color: null,

		/**
		 * @type {boolean}
		 */
		autofocus: true,

		/**
		 * Internal use only: Monitored by the {ts.ui.AsideSpirit}.
		 * @type {boolean}
		 */
		gofocused: false,

		/**
		 * Block the {ts.ui.AsideSpirit} from declaring itself open. Relates
		 * to some kind of internal performance optimization for SELECT menus.
		 * @type {boolean}
		 */
		suspendopen: false,

		/**
		 * Make a footer for the aside. Only support buttons in the footer right now.
		 * @type {object}
		 */
		footer: null,

		/**
		 * Make sure that `items` exist.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.items = this.items || []; // becomes {ts.ui.Collection}, see above
			this.addObserver(this);
		},

		/**
		 * TODO (jmo@): Destruct is not really implemented (memory implications)
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.removeObserver(this);
		},

		/**
		 * Handle changes.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			changes.forEach(function(c) {
				if (c.name === 'status') {
					var method = c.newValue;
					if (this[method]) {
						this[method]();
					}
				}
			}, this);
		},

		/**
		 * Mark as open.
		 * @returns {ts.ui.AsideModel}
		 */
		open: chained(function() {
			this.isOpen = true;
		}),

		/**
		 * Mark as closed.
		 * @returns {ts.ui.AsideModel}
		 */
		close: chained(function() {
			this.isOpen = false;
		}),

		/**
		 * Focus something in the Aside. This toggle gets picked up by
		 * the {ts.ui.AsideSpirit} which will soon set it back to `false`,
		 * @returns {ts.ui.AsideModel}
		 */
		focus: chained(function() {
			this.gofocused = true;
		}),

		/**
		 * Allow the {ts.ui.AsideSpirit} to declare itself open. Again,
		 * these things must be synchronized xframe via property toggles.
		 * @returns {ts.ui.MenuModel}
		 */
		unsuspendopen: chained(function() {
			this.suspendopen = false;
		})
	});
})(gui.Combo.chained);

/**
 * Generate methods `blue` `green` `purple` and so
 * on to change the general color scheme of the Aside.
 * Note that `white` and `lite` both translate to blue!
 * @using {Object} methods
 */
(function generatercode(methods) {
	var proto = ts.ui.AsideModel.prototype;
	gui.Object.each(methods, function(method, classname) {
		proto[method] = function() {
			this.color = classname;
			return this;
		};
	});
})(ts.ui.BACKGROUND_COLORS);
