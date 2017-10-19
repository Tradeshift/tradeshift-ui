/**
 * Layout module.
 */
gui.module('layout-gui@tradeshift.com', {
	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		// ['[data-ts=Layout]', ts.ui.LayoutSpirit],
		['[data-ts=Board]', ts.ui.BoardSpirit],
		['[data-ts=Panel]', ts.ui.PanelSpirit],
		['[data-ts=Panels]', ts.ui.PanelsSpirit],
		['[data-ts=Aside]', ts.ui.AsideSpirit],
		['[data-ts=SideBar]', ts.ui.SideBarSpirit],
		['[data-ts=Modal]', ts.ui.ModalSpirit],
		['[data-ts=App]', ts.ui.AppSpirit],
		['[data-ts=Main]', ts.ui.MainSpirit],
		['[data-ts=Mains]', ts.ui.MainsSpirit],
		['[data-ts=Content]', ts.ui.ContentSpirit],
		['[data-ts=MainContent]', ts.ui.MainContentSpirit] // TODO: remove soon!
	],

	/**
	 * Send in the plugins.
	 */
	oncontextinitialize: function() {
		ts.ui.PanelsSpirit.plugin('panels', ts.ui.PanelsPlugin);
		ts.ui.ModalSpirit.plugin('doorman', ts.ui.DoorManPlugin);
		ts.ui.SideShowSpirit.plugin('doorman', ts.ui.DoorManPlugin);
	},

	/**
	 * Parse optional metatags to produce a nice header.
	 */
	onbeforespiritualize: function() {
		function setupheader(meta, link) {
			if (meta && meta.content) {
				ts.ui.Header.title(meta.content);
			}
			if (link && link.getAttribute('href')) {
				ts.ui.Header.icon(link.href);
			}
		}
		(function init(meta, link) {
			setupheader(document.head.querySelector(meta), document.head.querySelector(link));
		})('meta[name=apple-mobile-web-app-title]', 'link[rel=apple-touch-icon]');
	}
});
