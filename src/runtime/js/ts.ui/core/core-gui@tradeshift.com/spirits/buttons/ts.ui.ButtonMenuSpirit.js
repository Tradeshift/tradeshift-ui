/**
 * Spirit of the ButtonMenu (for semantics only).
 * @extends {ts.ui.Spirit}
 */
ts.ui.ButtonMenuSpirit = ts.ui.Spirit.extend({
	/**
	 * Channel spirits for complex selectors as soon as the
	 * first `Buttons` component is encountered on the page
	 * (because these selectors come with a performance hit).
	 */
	onconstruct: function() {
		this.super.onconstruct();
		ts.ui.CoreModule.channelComplexSelectors(!this.css.contains(ts.ui.CLASS_OPTIMIZED));
	}
});
