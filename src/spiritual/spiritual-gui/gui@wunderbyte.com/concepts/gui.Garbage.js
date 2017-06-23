/**
 * Where spirits go to be garbage collected. Not for public
 * consumption: Please dispose of spirits via the {gui.Guide}.
 * TODO: Don't assume that we are collecting spirits primarily
 * @see {gui.Guide#materialize}
 * @see {gui.Guide#materializeOne}
 * @see {gui.Guide#materializeSub}
 */
gui.Garbage = {
	/**
	 * To identify our exception in a try-catch scenario, look for
	 * this string in the *beginning* of the exception message
	 * since sometimes we might append additional information.
	 * @type {string}
	 */
	DENIAL: 'Attempt to handle destructed object',

	/**
	 * Identification.
	 * @returns {string}
	 */
	toString: function() {
		return '[object gui.Garbage]';
	},

	/**
	 * Nukefication moved to next tick. This will minimize chaos,
	 * but does imply that for the duration of this tick, methods
	 * might be called on spirits that don't exist in the DOM and
	 * this should technically not be possible :/
	 */
	ontick: function(t) {
		if (t.type === 'gui-tick-garbage-empty') {
			if (window.gui) {
				// hotfix IE window unloaded scenario (TODO: still?)
				this._nukemnow();
			}
		}
	},

	// Privileged ................................................................

	/**
	 * Schedule to nuke the spirit.
	 * TODO: Make this work for stuff that ain't exactly spirits
	 * @param {gui.Spirit} spirit
	 */
	$collect: function(spirit) {
		if (gui.unloading) {
			this.$nuke(spirit);
		} else {
			this._spirits.push(spirit);
			gui.Tick.dispatch('gui-tick-garbage-empty');
		}
	},

	/**
	 * Nuke that spirit.
	 *
	 * - Nuke lazy plugins so that we don't accidentally instantiate them
	 * - Destruct remaining plugins, saving the {gui.Life} plugin for last
	 * - Replace all properties with an accessor to throw an exception
	 *
	 * @param {gui.Spirit} spirit
	 */
	$nuke: function(spirit) {
		var prefixes = [],
			plugins = spirit.life.plugins;
		gui.Object.each(plugins, function(prefix, instantiated) {
			if (instantiated) {
				if (prefix !== 'life') {
					prefixes.push(prefix);
				}
			} else {
				Object.defineProperty(spirit, prefix, {
					enumerable: true,
					configurable: true,
					get: function() {},
					set: function() {}
				});
			}
		});
		plugins = prefixes.map(function(key) {
			return spirit[key];
		}, this);
		if (!gui.unloading) {
			this.$nukeplugins(plugins, false);
			gui.Tick.next(function() {
				// TODO: organize this at some point...
				this.$nukeplugins(plugins, true);
				this.$nukeelement(spirit);
				this.$nukeallofit(spirit);
			}, this);
		}
	},

	/**
	 * Nuke plugins in three steps to minimize access violations.
	 * @param {gui.Spirit} spirit
	 * @param {Array<String>} prefixes
	 * @param {boolean} nuke
	 */
	$nukeplugins: function(plugins, nuke) {
		if (nuke) {
			plugins.forEach(function(plugin) {
				this.$nukeallofit(plugin);
			}, this);
		} else {
			plugins
				.map(function(plugin) {
					plugin.ondestruct();
					return plugin;
				})
				.forEach(function(plugin) {
					plugin.$ondestruct();
				});
		}
	},

	/**
	 * Unreference spirit associated element.
	 * Explorer may deny permission in frames.
	 * @TODO: Is IE exception still relevant?
	 */
	$nukeelement: function(spirit) {
		try {
			spirit.element.spirit = null;
		} catch (denied) {}
	},

	/**
	 * Replace own properties with an accessor to throw an exception.
	 * In 'gui.debug' mode we replace all props, not just own props,
	 * so that we may fail fast on attempt to handle destructed spirit.
	 * @TODO: keep track of non-enumerables and nuke those as well :/
	 * @param {object} thing
	 */
	$nukeallofit: function(thing) {
		var nativeprops = Object.prototype;
		if (!gui.unloading && !thing.$destructed) {
			thing.$destructed = true;
			for (var prop in thing) {
				if (thing.hasOwnProperty(prop) || gui.debug) {
					if (nativeprops[prop] === undefined) {
						if (prop !== '$destructed') {
							var desc = Object.getOwnPropertyDescriptor(thing, prop);
							if (!desc || desc.configurable) {
								if (gui.debug) {
									this._definePropertyItentified(thing, prop);
								} else {
									Object.defineProperty(thing, prop, this.DENIED);
								}
							}
						}
					}
				}
			}
		}
	},

	/**
	 * User to access property post destruction,
	 * report that the spirit was terminated.
	 */
	DENIED: {
		enumerable: true,
		configurable: true,
		get: function() {
			gui.Garbage.DENY();
		},
		set: function() {
			gui.Garbage.DENY();
		}
	},

	/**
	 * Obscure mechanism to include the whole stacktrace in the error message
	 * because some kind of Selenium WebDriver can't print stack traces...
	 * @see https://gist.github.com/jay3sh/1158940
	 * @param @optional {string} message
	 */
	DENY: function(message) {
		var stack,
			e = new Error(gui.Garbage.DENIAL + (message ? ': ' + message : ''));
		if (!gui.Client.isExplorer && (stack = e.stack)) {
			if (gui.Client.isWebKit) {
				stack = stack
					.replace(/^[^\(]+?[\n$]/gm, '')
					.replace(/^\s+at\s+/gm, '')
					.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
					.split('\n');
			} else {
				stack = stack.split('\n');
			}
			stack.shift();
			stack.shift(); // @TODO: shift one more now?
			console.warn(e.message + '\n' + stack);
		} else {
			console.warn(e.message);
		}
	},

	// Private ...................................................................

	/**
	 * Spirits scheduled for destruction.
	 * @type {Array<gui.Spirit>}
	 */
	_spirits: [],

	/**
	 * In debug mode, throw a more qualified "attempt to handle destructed spirit"
	 * @param {object} thing
	 * @param {string} prop
	 */
	_definePropertyItentified: function(thing, prop) {
		Object.defineProperty(thing, prop, {
			enumerable: true,
			configurable: true,
			get: function() {
				gui.Garbage.DENY(thing);
			},
			set: function() {
				gui.Garbage.DENY(thing);
			}
		});
	},

	/**
	 * Nuke spirits now.
	 */
	_nukemnow: function() {
		var spirit,
			spirits = this._spirits.slice();
		if (window.gui) {
			// hotfix IE window unloaded scenario...
			while ((spirit = spirits.shift())) {
				this.$nuke(spirit);
			}
			this._spirits = [];
		}
	}
};

gui.Tick.add('gui-tick-garbage-empty', gui.Garbage);
