/**
 * Objects GUI module.
 */
gui.module('layout-gui@tradeshift.com', {
	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		['[data-ts=Box]', ts.ui.BoxSpirit],
		['[data-ts=TabBox]', ts.ui.TabBoxSpirit],
		['[data-ts=TabPanels]', ts.ui.TabPanelsSpirit],
		['[data-ts=TabPanel]', ts.ui.TabPanelSpirit]
	],

	/**
	 *
	 */
	oncontextinitialize: function() {
		ts.ui.TabPanelsSpirit.plugin('panels', ts.ui.PanelsPlugin);
	},

	/**
	 *
	 */
	onbeforespiritualize: function() {
		function setupheader(meta, link) {
			if (meta && meta.content) {
				ts.ui.Header.title(meta.content);
			}
			if (link && link.href) {
				ts.ui.Header.icon(link.href);
			}
		}
		(function init(meta, link) {
			setupheader(document.head.querySelector(meta), document.head.querySelector(link));
		})('meta[name=apple-mobile-web-app-title]', 'link[rel=apple-touch-icon]');
	}
});
