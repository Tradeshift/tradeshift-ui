/**
 * Bars GUI module.
 */
gui.module('bars-gui@tradeshift.com', {

	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		
		// OLD
		/*
		['[ts-tabbar]', ts.ui.TabBarSpirit],
		['[ts-topbar]', ts.ui.TopBarSpirit],
		['[ts-toolbar]', ts.ui.ToolBarSpirit],
		*/
		
		// NEW
		["[data-ts=TopBar]", ts.ui.TopBarSpirit],
		["[data-ts=TabBar]", ts.ui.TabBarSpirit],
		['[data-ts=ToolBar]', ts.ui.ToolBarSpirit],
		['[data-ts=StatusBar]', ts.ui.StatusBarSpirit],
	]

});
