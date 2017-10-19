/**
 * Spirit of the main section.
 * @extends {ts.ui.PanelSpirit}
 */
ts.ui.MainSpirit = ts.ui.PanelSpirit.extend({
	/**
	 * 
	 */
	onenter: function() {
		this.super.onenter();
		if (this.dom.parent().classList.contains('ts-panel')) {
			if (this.dom.ancestor(ts.ui.ModalSpirit)) {
				console.error('The Main in Modal is deprecated. Please replace it with a Box.');
			}
		}
	}
});
