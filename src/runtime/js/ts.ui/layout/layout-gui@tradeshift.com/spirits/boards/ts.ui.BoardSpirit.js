/**
 * Spirit of the board.
 * @extends {ts.ui.LayoutSpirit}
 * @using {ts.uiPanelsSpirit} PanelsSpirit
 * @using {gui.Combo#chained} chained
 */
ts.ui.BoardSpirit = (function using(PanelsSpirit, PanelSpirit, chained) {
	/**
	 * Reduce to heighest panel.
	 * @param {number} max
	 * @parapm {ts.ui.PanelSpirit}
	 */
	function maxheight(max, next) {
		if (next) {
			var was = next.visible;
			next.visible = true;
			var fit = next.box.height;
			next.visible = was;
			return fit > max ? fit : max;
		}
		return max;
	}

	return ts.ui.LayoutSpirit.extend({
		/**
		 * Equalsize panels height to match the highest panel.
		 * TODO: Pure CSS solution should be possible nowadays.
		 * @param {boolean} enable
		 * @returns {this}
		 */
		equalsize: chained(function(enable) {
			var root = this.dom.child(PanelsSpirit);
			if (root) {
				var kids = root.dom.children(PanelSpirit);
				var dont = kids.length <= 1 || !enable;
				var next = dont ? '' : kids.reduce(maxheight, 0);
				root.css.minHeight = next;
				root.css.maxHeight = next;
				this.css.shift(!dont, 'ts-equalsize');
			}
		})
	});
})(ts.ui.PanelsSpirit, ts.ui.PanelSpirit, gui.Combo.chained);
