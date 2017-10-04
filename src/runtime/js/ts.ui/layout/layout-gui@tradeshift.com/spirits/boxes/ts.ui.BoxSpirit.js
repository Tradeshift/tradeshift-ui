/**
 * Spirit of the box.
 * @using {ts.ui.TabBarSpirit} TabBarSpirit
 * @using {ts.ui.PanelsSpirit} PanelsSpirt
 * @using {ts.ui.PanelSpirit} PanelSpirit
 * @using {gui.Combo#chained} chained
 */
ts.ui.BoxSpirit = (function using(TabBarSpirit, PanelsSpirit, PanelSpirit, chained) {
	/**
	 * Reduce to heighest panel.
	 * @param {number} max
	 * @parapm {ts.ui.PanelSpirit}
	 */
	function maxheight(max, next) {
		var was = next.dom.visible;
		next.dom.visible = true;
		var fit = next.box.height;
		next.dom.visible = was;
		return fit > max ? fit : max;
	}

	return ts.ui.Spirit.extend({
		/**
		 * Get or set the buttons in the statusbar.
		 * so will simply not allow that.
		 * @param @optional {Array<Object>} json
		 * @returns {ts.ui.ButtonsCollection|ts.ui.ModalSpirit}
		 */
		buttons: chained(function(json) {
			var bar = this._bar();
			if (arguments.length) {
				bar.buttons(json);
			} else {
				return bar.buttons();
			}
		}),

		/**
		 * Get or set the tabs.
		 * @param @optional {Array<Object>} json
		 * @returns {Array<ts.ui.TabModel>|ts.ui.ModalSpirit}
		 */
		tabs: chained(function(json) {
			var bar = this._bar();
			if (arguments.length) {
				bar.tabs(json);
			} else {
				return bar.tabs();
			}
		}),

		/*
		 * Equalsize panels height to match the highest panel.
		 * @param {boolean} enable
		 * @returns {this}
		 */
		equalsize: chained(function(enable) {
			var panels = this.dom.child(PanelsSpirit);
			if (panels && (panels = panels.dom.children(PanelSpirit)).length) {
				var height = panels.reduce(maxheight, 0);
				panels.forEach(function(p) {
					p.css.height = enable ? height : '';
				});
			}
		}),

		// Privileged ..............................................................

		/**
		 * Called by the {ts.ui.PanelsPlugin} to append a tab.
		 * @param {Object} json
		 * @param {number} index
		 */
		$insertTab: function(json, index) {
			var tabs = this._bar().tabs();
			tabs.splice(index, 0, json);
		},

		$selectTab: function() {
			console.log('TODO: $selectTab');
		},

		// Private .................................................................

		/**
		 *
		 */
		_tabbar: null,

		/**
		 * @returns {ts.ui.TabBarSpirit}
		 */
		_bar: function() {
			this.css.add('ts-box-hasbar');
			return this._tabbar || (this._tabbar = this.dom.prepend(TabBarSpirit.summon()));
		}
	});
})(ts.ui.TabBarSpirit, ts.ui.PanelsSpirit, ts.ui.PanelSpirit, gui.Combo.chained);
