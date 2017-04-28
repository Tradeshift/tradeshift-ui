/**
 * Namepspace object.
 */
window.edbml = gui.namespace('edbml', {
	/**
	 * Spirits will dispatch this action when EDBML has rendered.
	 */
	ACTION_RENDER: 'edbml-action-render',

	/**
	 * Automatically load EDBML scripts by naming convention?
	 * (ns.MySpirit would automatically load ns.MySpirit.edbml)
	 * @type {boolean}
	 */
	bootload: false,

	/**
	 * EDBML script declaration micro DSL.
	 * @param {String} id
	 */
	declare: function(id) {
		var configured;
		return {
			as: function($edbml) {
				configured = edbml.$runtimeconfigure($edbml);
				configured = gui.Object.assert(id, configured);
				configured.lock = function(out) {
					return function lockedout() {
						$edbml.$out = out;
						return configured.apply(this, arguments);
					};
				};
				return this;
			},
			withInstructions: function(pis) {
				configured.$instructions = pis;
			}
		};
	},

	/**
	 * Escape potentially unsafe string for use in HTML body context.
	 * @param {string} string
	 * @returns {string}
	 */
	safetext: function(string) {
		return edbml.Security.$safetext(string);
	},

	/**
	 * Escape potentially unsafe string for use in HTML attribute value.
	 * @param {string} string
	 * @returns {string}
	 */
	safeattr: function(string) {
		return edbml.Security.$safeattr(string);
	},

	// Privileged ................................................................

	/**
	 * Register action to execute later.
	 * @param {function} action
	 * @param {object} thisp
	 * @returns {function}
	 */
	$set: function(action, thisp) {
		return edbml._assign(action, thisp);
	},

	/**
	 * Get something from registered action.
	 * NOTE: {gui.ConfigPlugin} hardcoded `$edb.get`
	 * TODO: {gui.ConfigPlugin} should not hardcode
	 * @param {string} key
	 * @param @optional {string} sig
	 */
	$get: function(key) {
		return edbml._request(key);
	},

	/**
	 * Execute action with no return value.
	 * NOTE: {edb.FunctionUpdate} hardcoded `edb.$run`
	 * TODO: why was this split up in two steps? Sandboxing?
	 * @param {Element} elm
	 * @param {string} key
	 * @param @optional {string} sig
	 */
	$run: function(elm, key) {
		this._invoke(key, elm.value, elm.checked);
	},

	/**
	 * Garbage collect function that isn't called by the
	 * GUI using whatever strategy they prefer nowadays.
	 */
	$revoke: function(key) {
		this._invokables[key] = null; // garbage one
		delete this._invokables[key]; // garbage two
	},

	/**
	 * Configure EDBML function for runtime use. Note
	 * that `this` refers to the spirit instance here.
	 * @see {ts.gui.ScriptPlugin#_runtimeconfigure}
	 * @param {function} $edbml The (compiled) function as served to the page
	 * @returns {function}
	 */
	$runtimeconfigure: (function scoped() {
		function setupbefore($edbml, spirit) {
			$edbml.$out = $edbml.$out || new edbml.Out();
			$edbml.$att = new edbml.Att();
			if (spirit) {
				$edbml.$input = function(Type) {
					return spirit.script.$input.get(Type);
				};
			}
		}
		function cleanupafter($edbml, spirit) {
			$edbml.$out = null;
			$edbml.$att = null;
			if (spirit) {
				$edbml.$input = null;
			}
		}
		return function($edbml) {
			return function configured($in) {
				setupbefore($edbml, this);
				var res = $edbml.apply(this, arguments);
				cleanupafter($edbml, this);
				return res;
			};
		};
	})(),

	// Private ...................................................................

	/**
	 * Mapping EDBML-internal functions to keys
	 * so that they may later be recalled to run.
	 * @type {Map<String,function>}
	 */
	_invokables: {},

	/**
	 * Map function to generated key and return the key.
	 * @param {function} func
	 * @param {object} thisp
	 * @returns {String}
	 */
	_assign: function(func, thisp) {
		var key = gui.KeyMaster.generateKey();
		this._invokables[key] = function(value, checked) {
			return func.apply(thisp, [gui.Type.cast(value), checked]);
		};
		return key;
	},

	/*
	 *
	 */
	_invoke: function(key, value, checked) {
		var func = this._invokables[key];
		if (func) {
			gui.Tick.time(function() {
				func(value, checked);
			});
		} else {
			console.error('Out of synch');
		}
	},

	/**
	 * Get invokable function by key.
	 * @param {string} key
	 * @returns {function}
	 */
	_request: function(key, sig) {
		var func;
		if (sig) {
			// TODO: this
			console.error('Not supported');
		} else {
			if ((func = this._invokables[key])) {
				return func();
			} else {
				console.error('Out of synch');
			}
		}
	}
});
