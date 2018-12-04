/**
 * Spirit of the SELECT.
 * @extends {gui.Spirit}
 */
ts.ui.SelectSpirit = ts.ui.FieldSpirit.extend({
	/**
	 * Attribute `ts.debugsync` can be toggled to induce random selections.
	 * This will come in handy when we attempt to synchronize everything.
	 * @type {boolean}
	 */
	debugsync: false,

	/**
	 * Let the developer customize their own select.
	 * @type {boolean}
	 */
	custom: false,

	/**
	 * Get ready.
	 */
	onready: function() {
		this.super.onready();
		this._debugsync(this.debugsync);
		this.css.add(ts.ui.CLASS_SELECT);
		this._createfake(ts.ui.FakeSelectInputSpirit).proxy(this.element);
	},

	// Private ...................................................................

	/**
	 * Now this is tricky: If this spirit happened to attach to an Angular
	 * template before Angular parsed the template, the temple will now
	 * contain the initialized markup including the fake input. In that case,
	 * we'll need to remove it first. There is unfortunately no way yo figure
	 * out, whether or not a piece of HTML is intended for a template, is the
	 * result of a template, or is not related to templates at all.
	 * TODO(jmo@): Link to Angular GitHub issue when online...
	 * @param {constructor} SelectInput
	 * @returns {ts.ui.FakeSelectInputSpirit}
	 */
	_createfake: function(SelectInput) {
		var oldfake = this.dom.following(ts.ui.TextInputSpirit); // huh?
		if (oldfake[0]) {
			oldfake[0].dom.remove();
		}
		return this.dom.after(SelectInput.summon());
	},

	/**
	 * Debug component synchronization. Change indexes and
	 * append new options. Don't try this in production.
	 * TODO: This in a test instead :)
	 * @param {boolean} enabled
	 */
	_debugsync: function(enabled) {
		var elm = this.element;
		var ops = elm.options;
		if (enabled) {
			setInterval(function updaterandomly() {
				if (elm.multiple) {
					console.log(
						'indexes: ' +
							gui.Array.from(ops)
								.map(function(o, i) {
									o.selected = Math.random() > 0.5;
									return o.selected ? i : null;
								})
								.filter(function(index) {
									return index !== null;
								})
					);
				} else {
					elm.selectedIndex = Math.floor(Math.random() * ops.length);
					console.log('index: ' + elm.selectedIndex);
				}
				var label = 'Option' + (ops.length + 1);
				elm.add(new Option(label, Math.random()));
			}, 2000);
		}
	}
});
