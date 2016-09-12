/**
 * Tables GUI module.
 */
gui.module('tables-gui@tradeshift.com', {

	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		
		// OLD
		['[ts-table]', ts.ui.TableSpirit],
		
		// NEW
		['[data-ts=Table]', ts.ui.TableSpirit]
	],

	/**
	 * Setup some special plugins for the Table 
	 * (to split the code up in smaller pieces).
	 */
	oncontextinitialize: function() {
		ts.ui.TableSpirit
			.plugin('editorplugin', ts.ui.TableEditPlugin)
			.plugin('layoutplugin', ts.ui.TableLayoutPlugin)
			.plugin('queryplugin', ts.ui.TableQueryPlugin);
	}

});
