/**
 * Spirit of the main element.
 */
ts.ui.MainContentSpirit = ts.ui.Spirit.extend({
	/**
	 * Configure.
	 */
	onconfigure: function() {
		this.super.onconfigure();
		this.element.tabIndex = -1;
	},

	/**
	 * Trap focus in the MAIN section so that TAB
	 * won't travel into ASIDE or exit the IFRAME.
	 */
	onready: function() {
		this.super.onready();
		/**
		 * @todo fix the root cause why the class doesn't get added
		 */
		this.css.add('ts-maincontent');
		if (gui.debug) {
			if (this.dom.qdocall('.ts-maincontent').length > 1) {
				console.log('There should be only on .ts-maincontent at any given time :/');
			}
		}
	}
});
