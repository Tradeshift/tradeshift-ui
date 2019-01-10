/**
 * Layout module.
 */
gui.module('layout-gui@tradeshift.com', {
	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		['[data-ts=Board]', ts.ui.BoardSpirit],
		['[data-ts=Panel]', ts.ui.PanelSpirit],
		['[data-ts=Panels]', ts.ui.PanelsSpirit],
		['[data-ts=Aside]', ts.ui.AsideSpirit],
		['[data-ts=SideBar]', ts.ui.SideBarSpirit],
		['[data-ts=Box]', ts.ui.BoxSpirit],
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
		function setupheader(title, color, link) {
			if (title && title.content) {
				ts.ui.Header.title(title.content);
			}
			if (color && color.content) {
				ts.ui.Header.color(color.content);
			}
			if (link && link.getAttribute('href')) {
				ts.ui.Header.icon(link.href);
			}
		}
		(function init(title, color, link) {
			setupheader(
				document.head.querySelector(title),
				document.head.querySelector(color),
				document.head.querySelector(link)
			);
		})('meta[name=ts-app-title]', 'meta[name=ts-app-color]', 'link[rel=ts-app-icon]');
	}
});
