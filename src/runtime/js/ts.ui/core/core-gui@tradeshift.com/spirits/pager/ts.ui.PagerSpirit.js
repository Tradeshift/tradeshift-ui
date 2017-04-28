/**
 * Spirit of the pager.
 * @extends {gui.Spirit}
 * @using {gui.Type} Type
 * @using {ts.ui.ButtonSpirit} ButtonSpirit
 * @using {gui.CSSPlugin} CSSPlugin
 */
ts.ui.PagerSpirit = (function using(Type, ButtonSpirit, CSSPlugin) {
	return ts.ui.Spirit.extend({
		/**
		 * Create the (default) model first so that it's
		 * ready to be configured via HTML attributes.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._model = new ts.ui.PagerModel();
		},

		/**
		 * Cleanup observers when destructed.
		 * TODO(jmo@): This should happen automatically!
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this._model.removeObserver(this);
		},

		/**
		 * Evaluate HTML attributes and load the script.
		 * Note that a NEW model may be assigned via the
		 * HTML atttributes (like in "ts.ui.pager.edbml").
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this._model.addObserver(this);
			this.script.load(ts.ui.PagerSpirit.edbml);
			this.script.input(this._model);
			this.event.add('click');
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			if (e.type === 'click') {
				var element = e.target;
				var button = ButtonSpirit.getButton(element);
				var model = this._model;
				if (button && !button.disabled) {
					this._update(button);
					this.tick.time(function unfreeze() {
						this._navigate(button, model);
					}, 30);
				}
			}
		},

		/**
		 * Total page count.
		 * @type {number}
		 */
		pages: {
			getter: function() {
				return this._model.pages;
			},
			setter: function(n) {
				this._model.pages = n;
			}
		},

		/**
		 * Current page.
		 * @type {number}
		 */
		page: {
			getter: function() {
				return this._model.page;
			},
			setter: function(n) {
				this._model.page = n;
			}
		},

		/**
		 * Open for implementation. Called whenever the model `page` changes.
		 * TODO: Rename this `onchange` when that method name refactoring is done.
		 * @type {function}
		 */
		onselect: null,

		/**
		 * Handle changes. Note that the model also has an `onselect`
		 * method, this evaluates the *spirits* `onselect` method.
		 * The timeout allows for the pager to update the selection
		 * before whatever big operation might happen happens after.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			var model = this._model;
			changes.forEach(function(change) {
				if (change.object === model && change.name === 'page') {
					this._onchange(change.newValue);
				}
			}, this);
		},

		// Private .................................................................

		/**
		 * The pager model itself.
		 * @type {ts.ui.PagerModel}
		 */
		_model: null,

		/**
		 * Update the button with DHTML for instant feedback before we change
		 * properties in the model (since we don't know what big operation might
		 * happen then). After the EDBML repaint, the result will look the same.
		 * @param {HTMLButtonElement} button
		 */
		_update: function(button) {
			if (button.getAttribute('data-page')) {
				this.dom.qall('button').forEach(function(b) {
					CSSPlugin.shift(b, b === button, 'ts-selected');
				});
			}
		},

		/**
		 * @param {number} index
		 */
		_onchange: function(index) {
			var callb = this.onselect;
			this.page = index;
			this.action.dispatch(ts.ui.ACTION_PAGER_SELECT, index);
			if (callb) {
				if (Type.isString(callb)) {
					// assigned via HTML attribute?
					callb = new Function(['index'], callb);
				}
				callb.call(this, this.page);
			}
		},

		/**
		 * @param {HTMLButtonElement} button
		 * @param {ts.ui.PagerModel} model
		 */
		_navigate: function(button, model) {
			var page = button.getAttribute('data-page');
			var jump = button.getAttribute('data-jump');
			if (page) {
				model.page = Type.cast(page);
			} else if (jump) {
				model[jump]();
			}
		}
	});
})(gui.Type, ts.ui.ButtonSpirit, gui.CSSPlugin);
