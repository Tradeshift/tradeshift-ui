/**
 * Advanced tab model.
 * @extends {ts.ui.Model}
 * @using {gui.Combo#chained}
 */
ts.ui.TabModel = (function using(chained) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'tab',

		/**
		 * Optional ID.
		 * @see {ts.ui.TabCollection#get}
		 * @type {string}
		 */
		id: null,

		/**
		 * Tab text.
		 * @type {String}
		 */
		label: null,

		/**
		 * Tab icon.
		 * @type {String}
		 */
		icon: null,

		/**
		 * Tab selected?
		 * @type {boolean}
		 */
		selected: false,

		/**
		 * Counting whatever you like.
		 * @type {number}
		 */
		counter: 0,

		/**
		 * Something to execute onselect.
		 * @type {function}
		 */
		onselect: null,

		/**
		 * Tab can be closed?
		 * @type {boolean}
		 */
		closeable: false,

		/**
		 * Tab show on the topbar?
		 * @type {boolean}
		 */
		$isontop: true,

		/**
		 * Something to execute onclose.
		 * @type {function}
		 */
		onclose: null,

		/**
		 * Alias {ts.ui.TabModel#closable}.
		 * @see https://uk.answers.yahoo.com/question/index?qid=20070329061734AAtI9Hc
		 */
		closable: {
			getter: function() {
				return this.closeable;
			},
			setter: function(value) {
				this.closeable = value;
			}
		},

		/**
		 * We add an observer to ourselves so that we can evaluate the `onselect`
		 * callback if anyone changes our `selected` property. This is especially
		 * useful in xframe (greenfield) setup where the `selected` property gets
		 * synchronized back from the chrome.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.addObserver(this);
			if (this.selected) {
				this._doselect();
			}
		},

		/**
		 * TODO: automate this step :/
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.removeObserver(this);
		},

		/**
		 * Handle changes.
		 * @param {Array<gui.Change>} changes
		 */
		onchange: function(changes) {
			// Just call _doselect
		},

		/**
		 * Select the tab.
		 * @return {ts.ui.TabModel}
		 */
		select: chained(function() {
			this.selected = true;
			this._doselect();
		}),

		/**
		 * Don't select the tab.
		 * @return {ts.ui.TabModel}
		 */
		unselect: chained(function() {
			this.selected = false;
		}),

		// Privileged ..............................................................

		/**
		 * Secret `onselect` for system private implementation.
		 * @type {function}
		 */
		$onselect: null,

		// Private .................................................................

		/**
		 * @type {number}
		 */
		_timeout: -1,

		/**
		 * Don't start loading AJAX or something
		 * with the button stuck in :focus mode.
		 */
		_doselect: function() {
			if (this.onselect || this.$onselect) {
				gui.Tick.cancelTime(this._timeout);
				this._timeout = gui.Tick.time(
					function unfreeze() {
						if (this.$onselect) {
							// system implementation
							this.$onselect();
						}
						if (this.onselect) {
							// user configurable
							this.onselect();
						}
					},
					25,
					this
				);
			}
		}
	});
})(gui.Combo.chained);
