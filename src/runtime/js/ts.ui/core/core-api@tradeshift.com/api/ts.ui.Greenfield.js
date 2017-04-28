/**
 * Framework-internal two-way messaging system.
 * @using {ts.ui.ACTION_GLOBAL_MESSAGE_UP} up
 * @using {ts.ui.ACTION_GLOBAL_MESSAGE_DOWN} down
 */
ts.ui.Greenfield = (function using(up, down) {
	/**
	 * Dispatching actions up or down. We'll
	 * redefine this method in `setupactions`
	 * @param {object} data
	 */
	var doaction = function(data) {};

	/**
	 * App frame signals up, host frame signals down.
	 */
	function setupactions() {
		if (ts.ui.appframe) {
			doaction = function(data) {
				gui.Action.ascendGlobal(document, up, data);
				handleactions();
			};
		} else if (ts.ui.subframe) {
			gui.get('main', function(main) {
				doaction = function(data) {
					main.action.descendGlobal(down, data);
				};
			});
		}
	}

	/*
	 * Setup tricky actions if:
	 *
	 * 1. We're in the sub frame (apphost)
	 * 2. We're in the app frame
	 */
	if (ts.ui.subframe || ts.ui.appframe) {
		if (gui.hasModule('core-gui@tradeshift.com')) {
			gui.ready(setupactions);
		} else {
			gui.init(setupactions);
		}
	}

	/**
	 * Handle actions *descending* from the Greenfield host.
	 * An equivalent handler for ascending actions has been
	 * setup in the {ts.ui.GreenfieldMainFrame} spirit.
	 * @param {ts.ui.DocumentSpirit} html
	 */
	function handleactions(html) {
		gui.Action.addGlobal(document, down, {
			onaction: function(a) {
				a.consume();
				if (a.data.action === 'apply') {
					ts.ui.Greenfield.$applyhere(a);
				}
			}
		});
	}

	/**
	 * Apply something in this context.
	 * @param {String} target
	 * @param {String} method
	 * @param {Array} params
	 */
	function applyhere(target, method, params) {
		target = gui.Object.lookup(target);
		target[method].apply(target, params);
		// var summary = target + '.' + method + ' (' + params.join(',') + ')';
		// console.debug('Applied ' + summary + ' in ' + document.title);
	}

	return {
		// Public ...........................................................

		/**
		 * Identification.
		 * @return {String}
		 */
		toString: function() {
			return '[object ts.ui.Greenfield]';
		},

		/**
		 * Mark function applicable for Greenfield remoting,
		 * creates new function marked with `$api` property.
		 * This property is only verified in the host frame.
		 * @param {function} base
		 * @return {function}
		 */
		api: function(base) {
			function api() {
				return base.apply(this, arguments);
			}
			api.$api = true;
			return api;
		},

		// Secret ..................................................................

		/**
		 * Apply something in reverse context. This method is framework internal
		 * and should not become part of the public API, indeed that is what the
		 * mysterious $dollar notation is supposed to signify.
		 * @param {String} target
		 * @param {String} method
		 * @param {String} method
		 */
		$applyreverse: function(target, method, params) {
			params = gui.Array.from(params);
			doaction({
				action: 'apply',
				target: target,
				method: method,
				params: params
			});
		},

		/**
		 * Apply something in this context.
		 * @see {ts.ui.GreenfieldMainFrame}
		 * @param {gui.Action} a
		 */
		$applyhere: function(a) {
			applyhere(a.data.target, a.data.method, a.data.params);
		}
	};
})(ts.ui.ACTION_GLOBAL_MESSAGE_UP, ts.ui.ACTION_GLOBAL_MESSAGE_DOWN);
