/**
 * CURRENTLY USED ONLY IN THE DOCS WEBSITE.
 */
ts.ui.NextIconSpirit = (function() {
	/**
	 * Cache resolved icons.
	 * @type {Map<string, Element>}
	 */
	var icons = {};

	/**
	 * Always append a cloned icon.
	 * @param {SVGElement} icon
	 * @returns {SVGElement}
	 */
	function clone(icon) {
		return icon.cloneNode(true);
	}

	return ts.ui.Spirit.extend({

		/**
		 * Monitor the `src` attribute.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.att.add('src');
		},

		/**
		 * Handle attribute changed.
		 * @param {gui.Att} att
		 */
		onatt: function(att) {
			this.super.onatt(att);
			if (att.name === 'src') {
				var src = att.value.trim();
				if (!att.value.startsWith('{')) {
					this._geticon(src).then(function(icon) {
						this.dom.empty().append(icon);
					}, this);
				}
			}
		},

		/**
		 * Get the icon.
		 * TODO: Resolve icon from external URL
		 * @param {string} src
		 * @returns {gui.Then}
		 */
		_geticon: function(src) {
			var icon = icons[src];
			var then = new gui.Then();
			if (!icon) {
				if (src.startsWith('#')) {
					if ((icon = document.querySelector(src))) {
						icons[src] = icon;
					} else {
						throw new Error(src + ' not found');
					}
				} else {
					console.error('TODO: Resolve icon from external URL');
				}
			}
			if (icon) {
				then.now(clone(icon));
			}
			return then;
		}
	});
}());
