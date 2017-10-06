/**
 * Spirit of the main element.
 * @extends {ts.ui.BoxSpirit}
 */
ts.ui.MainSpirit = ts.ui.BoxSpirit.extend({
	/**
	 * Inject the header (which may have been configured before this existed).
	 * @see {ts.ui.Header}
	 * @param {ts.ui.HeaderBarSpirit} header
	 */
	$head: function(header) {
		this.dom.prepend(header);
	},

	/**
	 * Inject the footer.
	 * @see {ts.ui.Footer}
	 * @param {ts.ui.FooterBarSpirit} header
	 */
	$foot: function(footer) {
		this.dom.append(footer);
	}
});
