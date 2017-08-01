/**
 * Bars GUI module.
 */
gui.module('bars-gui@tradeshift.com', {
	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		['[data-ts=TopBar]', ts.ui.TopBarSpirit],
		['[data-ts=TabBar]', ts.ui.TabBarSpirit],
		['[data-ts=ToolBar]', ts.ui.ToolBarSpirit],
		['[data-ts=StatusBar]', ts.ui.StatusBarSpirit],
		['[data-ts=FooterBar]', ts.ui.FooterBarSpirit]
	]
});
