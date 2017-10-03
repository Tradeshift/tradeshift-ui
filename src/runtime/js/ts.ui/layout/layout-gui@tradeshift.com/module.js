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
		['[data-ts=Panels]', ts.ui.PanelsSpirit]
	],

	/**
	 *
	 */
	oncontextinitialize: function() {
		ts.ui.PanelsSpirit.plugin('panels', ts.ui.PanelsPlugin);
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
