/**
 * Spirit of the markup snippet.
 */
ts.dox.MarkupSpirit = ts.dox.PrismSpirit.extend({
	/**
	 * Special setup for markup the tabs a rendering.
	 */
	onenter: function() {
		this.super.onenter();
		if (this.dom.q('.output')) {
			this._initialize(this.dom.q('.tabpanels'), this.dom.qall('.tabpanels > *'));
		}
	},

	// Private ...................................................................

	/**
	 * @param {object} config
	 */
	_parseconfig: function(config) {
		this.super._parseconfig(config);
		var flip = config.flip;
		var that = this;
		if (config.outs) {
			var tabs = [
				{
					label: 'Markup',
					selected: !config.flip,
					onselect: function() {
						that._togglepanels(flip ? 0 : 1, flip ? 1 : 0);
					}
				},
				{
					label: 'Render',
					selected: config.flip,
					onselect: function() {
						that._togglepanels(flip ? 1 : 0, flip ? 0 : 1);
					}
				}
			];
			if (flip) {
				tabs.reverse();
			}
			this._toolbar.tabs(tabs);
			this._toolbar.script.run();
		}
	},

	/**
	 * Fix height to the heighest panel and hide all but the first panel.
	 * @param {HTMLDivElement} parent
	 * @param {Array<HTMLElement>} panels
	 */
	_initialize: function(parent, panels) {
		parent.style.minHeight =
			panels.reduce(function(max, panel, index) {
				var height = panel.offsetHeight;
				panel.style.display = index > 0 ? 'none' : 'block';
				return height > max ? height : max;
			}, 0) + 'px';
	},

	/**
	 * Toggle panels in a hacked up way.
	 * @param {number} oldindex
	 * @param {number} newindex
	 */
	_togglepanels: function(oldindex, newindex) {
		var panels = this.dom.qall('.tabpanels > *');
		panels[oldindex].style.display = 'none';
		panels[newindex].style.display = 'block';
	}
});
