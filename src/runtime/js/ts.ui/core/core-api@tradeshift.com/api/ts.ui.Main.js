/**
 * Features for the Main section.
 * @using {gui.Arguments#confirmed} confirmed
 */
ts.ui.Main = (function using(confirmed) {
	/**
	 * Get the Main spirit.
	 * @returns {ts.ui.MainSpirit}
	 */
	function getmain() {
		var main = ts.ui.get('.ts-main');
		if (main) {
			return main;
		} else {
			throw new Error("The Main component either doesn't exist or it is not initialized yet.");
		}
	}

	/**
	 * Get the ToolBar either now or when it is initialized.
	 * @param {function} action
	 * @param @optional {function} cb
	 */
	function getbar(action, cb) {
		if (cb) {
			gui.ready(function() {
				cb(action());
			});
		} else {
			return action();
		}
	}

	return {
		/**
		 * Identification.
		 * @returns {string}
		 */
		toString: function() {
			return '[object ts.ui.Main]';
		},

		/**
		 * Get the TabBar.
		 * @param @optional {function} cb
		 * @returns {ts.ui.TabBarSpirit}
		 */
		tabbar: confirmed('(function)')(function(cb) {
			return getbar(function() {
				return getmain().tabbar();
			}, cb);
		}),

		/**
		 * Get the ToolBar.
		 *	@param @optional {function} cb
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		toolbar: confirmed('(function)')(function(cb) {
			// return getmain().toolbar();
			return getbar(function() {
				return getmain().toolbar();
			}, cb);
		}),

		/**
		 * Get the StatusBar.
		 * @param @optional {function} cb
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		statusbar: confirmed('(function)')(function(cb) {
			return getbar(function() {
				return getmain().statusbar();
			}, cb);
		})
	};
})(gui.Arguments.confirmed);
