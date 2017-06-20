/**
 * Footer API.
 * @using {gui.Combo#chained} chained
 */
ts.ui.Footer = (function using(chained) {
	/**
	 * @returns {ts.ui.FooterSpirit}
	 */
	function footer() {
		if (!footer.spirit) {
			var spirit = ts.ui.FooterSpirit.summon();
			spirit.dom.appendTo(document.body);
			footer.spirit = spirit;
		}
		return footer.spirit;
	}

	/*
	 * Public methods ............................................................
	 */
	return {
		/**
		 * Something has selection somewhere?
		 * @type {boolean}
		 */
		selected: false,

		/**
		 * Open for implementation.
		 * @type {Function}
		 */
		onselectall: null,

		/**
		 * Open for implementation.
		 * @type {Function}
		 */
		onunselectall: null,

		/**
		 * 
		 */
		selectable: chained(function(onselectall, onunselectall) {
			this.onselectall = onselectall || null;
			this.onunselectall = onunselectall || null;
			footer().selectable();
		}),

		/**
		 *
		 */
		unselectable: chained(function() {
			this.onselectall = null;
			this.onunselectall = null;
			footer().unselectable();
		}),

		/**
		 * 
		 */
		status: chained(function(message) {
			if (arguments.length) {
				footer().status(message);
			} else {
				return footer().status();
			}
		}),

		/**
		 * @param {Array<object>|ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(buttons) {
			if (arguments.length) {
				footer().buttons(buttons);
			} else {
				return footer().buttons();
			}
		}),

		/**
		 * @param {Array<object>|ts.ui.ActionCollection} [actions]
		 * @returns {this|ts.ui.ActionCollection}
		 */
		actions: chained(function(buttons) {
			if (arguments.length) {
				footer().actions(buttons);
			} else {
				return footer().actions();
			}
		}),

		/**
		 * @param @optional {Object|ts.ui.PagerModel|null} [pager]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		pager: chained(function(pager) {
			if (arguments.length) {
				footer().pager(pager);
			} else {
				return footer().pager();
			}
		}),

		// Privileged ..............................................................

		/**
		 * Mark something as selected (somewhere).
		 * @param {boolean} selected
		 */
		$select: function(selected) {
			footer().selected(selected);
		}
	};
})(gui.Combo.chained);

/**
 * This thing should be implemented as an accessor because 
 * some API with a single boolean argument just aint right.
 */
(function scoped(now) {
	Object.defineProperty(ts.ui.Footer, 'selected', {
		get: function() {
			return now;
		},
		set: function(value) {
			var was = now;
			now = !!value;
			if (now !== was) {
				this.$select(now);
			}
		}
	});
})(ts.ui.Footer.selected);
