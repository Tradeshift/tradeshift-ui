/**
 * Some backwards compatibility.
 * @extends {ts.ui.ContentSpirit}
 */
ts.ui.MainContentSpirit = ts.ui.ContentSpirit.extend({
	onenter: function() {
		this.super.onenter();
		console.error('"MainContent" is deprecated. Please use "Content"');
	}
});
