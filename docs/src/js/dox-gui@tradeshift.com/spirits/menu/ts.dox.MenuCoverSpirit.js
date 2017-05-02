ts.dox.MenuCoverSpirit = (function() {
	return ts.dox.ItemSpirit.extend({
		onasync: function() {
			this.super.onasync();
			if (gui.Client.isWebKit) {
				this.css.left = 0 - 5; // Custom CSS scrollbar!
			} else {
				this.css.left = 0 - gui.Client.scrollBarSize;
			}
		},

		/**
		 * @overloads {ts.dox.ItemSpirit#ontween}
		 */
		ontween: function(t) {
			this.super.ontween(t);
			if (t.type === 'doxmenu') {
				if (t.init) {
					this.css.height = window.innerHeight;
				} else if (t.done) {
					this.css.height = 0;
				}
			}
		}
	});
})();
