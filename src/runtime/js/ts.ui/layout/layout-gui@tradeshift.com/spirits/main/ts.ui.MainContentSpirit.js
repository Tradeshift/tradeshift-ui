/**
 * Some backwards compatibility.
 */
ts.ui.MainContentSpirit = ts.ui.ContentSpirit.extend({
	onenter: function() {
		this.super.onenter();
		console.warn('"MainContent" is deprecated. Please use the "Content" component');
	}
});
