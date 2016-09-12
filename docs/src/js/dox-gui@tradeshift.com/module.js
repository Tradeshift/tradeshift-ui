/**
 * Dox GUI module.
 */
gui.module('dox-gui@tradeshift.com', {

	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		["[data-ts=DoxChrome]", ts.dox.ChromeSpirit],
		["[data-ts=DoxMenu]", ts.dox.MenuSpirit],
		["[data-ts=DoxItem]", ts.dox.ItemSpirit],
		["[data-ts=DoxSubMenu]", ts.dox.SubMenuSpirit],
		['[data-ts=DoxMarkup]', ts.dox.MarkupSpirit],
		['[data-ts=DoxScript]', ts.dox.JavaScriptSpirit],
		['[data-ts=DoxApi]', ts.dox.ApiTableSpirit]
	],
	
	oncontextinitialize: function() {
		gui.attributes.push('docs'); // needed still?
		if(window !== top) {
			this._sectionclassname(location.href);
		}
	},
	
	/**
	 * Extract the section name from the URL and 
	 * attach it as a classname on the HTML tag 
	 * so we can style this section amazingly.
	 * @param {string} href
	 */
	_sectionclassname: function(href) {
		var rest = href.split('/dist/')[1];
		var root = document.documentElement;
		if(rest && rest.length) {
			gui.CSSPlugin.add(root, rest.split('/')[0]);
		}
	}

});
