/*
 * Register module.
 */
gui.module('edbml@wunderbyte.com', {
	/*
	 * Mixin properties and method.
	 */
	mixin: {
		/**
		 * TODO: support accessor and implement as property
		 * @param {String|function} script
		 */
		src: function(script) {
			if (gui.Type.isString(script)) {
				var func = gui.Object.lookup(script);
				if (func) {
					script = func;
				} else {
					throw new Error(this + ' could not locate "' + script + '"');
				}
			}
			if (gui.Type.isFunction(script)) {
				this.script.load(script);
			} else {
				throw new TypeError(this + ' could not load script');
			}
		},

		/**
		 * Called whenever the EDBML script was evaluated.
		 * @param {TODOTHING} summary
		 */
		onrender: function(summary) {},

		/**
		 * Handle changes.
		 * @param {Array<edb.ObjectChange|edb.ArrayChange>}
		 */
		onchange: function(changes) {},

		/**
		 * Handle input.
		 * @param {edb.Input} input
		 */
		oninput: function(input) {},

		/**
		 * Handle directed input. Setup to require
		 * the input listener be to be added first.
		 * @see {edb.InputPlugin}
		 * TODO: when to destruct the type?
		 */
		$oninput: function(input) {
			this.script.input.match(input);
		}
	},

	/*
	 * Register plugins for all spirits.
	 */
	plugin: {
		script: edbml.ScriptPlugin
	},

	/*
	 * Channeling spirits to CSS selectors.
	 */
	channel: [['.gui-script', 'edbml.ScriptSpirit']],

	/**
	 * Setup environment.
	 */
	oncontextinitialize: function() {
		/*
		 * Automatically load spirit scripts by naming convention?
		 * ns.MySpirit would automatically load ns.MySpirit.edbml
		 */
		var edbmlscript,
			basespirit = gui.Spirit.prototype;
		gui.Function.decorateAfter(basespirit, 'onconfigure', function() {
			if (edbml.bootload && !this.script.loaded) {
				edbmlscript = gui.Object.lookup(this.$classname + '.edbml');
				if (gui.Type.isFunction(edbmlscript)) {
					this.script.load(edbmlscript);
				}
			}
		});

		/*
		 * Nasty hack to circumvent that we hardcode "event" into inline poke
		 * events, this creates an undesired global variable, but fixes an
		 * exception in the console, at least I think this was the problem.
		 */
		if (!window.event) {
			try {
				window.event = null;
			} catch (ieexception) {}
		}
	}
});
