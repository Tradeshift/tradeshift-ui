/**
 * Advanced select model.
 * @extends {ts.ui.Model}
 */
ts.ui.SelectModel = ts.ui.Model.extend({
	/**
	 * Friendly name.
	 * @type {string}
	 */
	item: 'select',

	/**
	 * @type {function}
	 * @param {string} value
	 */
	onchange: null,

	/**
	 * Select option value OR by numeric index.
	 * @param {string|number} what
	 * @return {ts.ui.SelectModel}
	 */
	select: function(what) {
		switch (gui.Type.of(what)) {
			case 'number':
				this.options.selectedIndex = what;
				break;
			default:
				console.error('TODO: select option by value');
				break;
		}
		return this;
	},

	/**
	 * Bounce model to HTML.
	 * @return {string}
	 */
	render: function() {
		return ts.ui.select.edbml(this);
	},

	/**
	 * Options collection.
	 * @type {ts.ui.Collection}
	 */
	options: ts.ui.Collection({
		item: 'options',
		selectedIndex: -1,
		$of: ts.ui.Model({
			item: 'option',
			label: null,
			value: null
		})
	})
});
