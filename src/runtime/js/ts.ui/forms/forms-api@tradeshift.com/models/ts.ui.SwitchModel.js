/**
 * Advanced switch model.
 * @extends {ts.ui.InputModel}
 */
ts.ui.SwitchModel = (function() {
  /**
   * TODO: Create an `OptionModel` to extend from!
   */
	return ts.ui.InputModel.extend({

    /**
     * Friendly name.
     * @type {string}
     */
		item: 'switch',

    /**
     * Data associated to the switch (Table scenario).
     */
		data: null,

    /**
     * Is checked?
     * @type {boolean}
     */
		checked: false,

    /**
     * Bounce model to HTML.
     * @returns {string}
     */
		render: function() {
			return ts.ui.switch.edbml(this);
		}
	});
}());
