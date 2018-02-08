/**
 * The ScriptPlugin shall render the spirits HTML.
 * @extends {gui.Plugin}
 * @using {gui.Combo.chained}
 * @using {gui.Arguments.confirmed}
 * @using {gui.Type} Type
 * @using {gui.Tick} Tick
 * @using {gui.Object} guiObject
 * @using {gui.Array} guiArray
 * @using {gui.DOMPlugin} DOMPlugin
 * @using {gui.Broadcast} Broadcast
 */
edbml.ScriptPlugin = (function using(
	chained,
	confirmed,
	Type,
	Tick,
	guiObject,
	guiArray,
	DOMPlugin,
	Broadcast
) {
	return gui.Plugin.extend({
		/**
		 * Script has been loaded?
		 * @type {boolean}
		 */
		loaded: false,

		/**
		 * Script has been run? Flipped after first run.
		 * TODO: deprecate and use 'spirit.life.rendered'
		 * @type {boolean}
		 */
		ran: false,

		/**
		 * Log development stuff to console?
		 * @type {boolean}
		 */
		debug: false,

		/**
		 * Rendering suspended?
		 * @type {boolean}
		 */
		suspended: false,

		/**
		 * Construction time.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._oldprops = {};
			this._newprops = {};
		},

		/**
		 * Destruction time.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			if (this.loaded) {
				Tick.cancelFrame(this._frameindex);
				this.spirit.life.remove(gui.LIFE_ENTER, this);
				Broadcast.remove(edb.BROADCAST_ACCESS, this);
				if (this.$input) {
					// TODO: interface for this (dispose)
					this.$input.ondestruct();
					this.$input.$ondestruct();
				}
				var oldprops = this._oldprops;
				Object.keys(oldprops).forEach(function(id) {
					try {
						oldprops[id].object.removeObserver(this);
					} catch (exception) {
						// could this possibly fail?
						console.error('Please tell jmo@ that you got this exception');
					}
				}, this);
			}
		},

		/**
		 * Load EDBML script.
		 * @param {function|String} script
		 * @returns {edb.ScriptPlugin}
		 */
		load: chained(
			confirmed('function|string')(function(script) {
				script = Type.isFunction(script) ? script : guiObject.lookup(script);
				if (script) {
					this.loaded = true;
					this._script = script;
					this._updater = new edbml.UpdateManager(this.spirit);
					this._process(script.$instructions);
					if (!this.$input) {
						this.run();
					}
				}
			})
		),

		/**
		 * Handle input.
		 * @param {edb.Input} input
		 */
		oninput: function(input) {
			if (this.loaded) {
				if (input.revoked) {
					this.write('');
				} else {
					if (!this.$input || this.$input.done) {
						this._schedule();
					}
				}
			} else {
				this._notloaded();
			}
		},

		/**
		 * Run script and write result to DOM (if needed).
		 */
		run: function(/* arguments */) {
			Tick.cancelFrame(this._frameindex);
			if (!this.spirit || this.spirit.$destructed) {
				console.warn('Attempt to handle destructed spirit');
			} else if (this.loaded) {
				if (!this.$input || this.$input.done) {
					if (this.spirit.life.entered) {
						this.write(this._run.apply(this, arguments));
					} else {
						this.spirit.life.add(gui.LIFE_ENTER, this);
						this._arguments = arguments;
					}
				} else {
					this._notready();
				}
			} else {
				this._notloaded();
			}
		},

		/**
		 * Write the actual HTML to screen. You should probably only
		 * call this method if you are producing your own markup
		 * somehow, ie. not using EDBML templates out of the box.
		 * @param {String} html
		 */
		write: function(html) {
			if (!this.suspended) {
				var changed = this._html !== html;
				var focused = this._focusedfield();
				if (changed) {
					this._html = html;
					this._updater.update(html);
					if (focused) {
						this._restorefocus(focused);
					}
				}
				this._status(this.spirit);
				this.ran = true;
			} else {
				if (edbml.debug) {
					console.debug('(ScriptPlugin was suspended)', this.$instanceid);
				}
			}
		},

		/**
		 * Privately input types(s) using `this.script.input(type)`
		 * @param {edb.Type|Array<edb.Type>}
		 * @returns {edb.Type|Array<edb.Type>}
		 */
		input: function(/* ...arguments */) {
			var inputs, input;
			if ((input = this.$input)) {
				if (this.loaded) {
					inputs = guiArray.make(arguments).map(function(type) {
						return new edb.Input(type.constructor, type);
					});
					/*
					 * This will give the user a chance to update
					 * the Type before we evaluate it internally.
					 * TODO: this would break the CoverSpirit CSS
					 * animation, look into how this works out...
					 */
					var that = this;
					// gui.Tick.next(function disabled_for_now() {
					if (!that.$destructed) {
						inputs.forEach(function(i) {
							input.$oninput(i);
						});
					}
					// });
					return inputs.length > 1 ? inputs : inputs[0]; // TODO: not return???
				} else {
					this._notloaded();
				}
			} else {
				this._noinputexpected();
			}
		},

		/**
		 * Privately revoke type(s). Accepts instances or constructors. Not tested!
		 */
		revoke: function(/* arguments */) {
			guiArray.make(arguments).forEach(function(type) {
				var edbType = edb.Type.is(type) ? type.constructor : type;
				this.$input.$oninput(new edb.Input(edbType, null));
			}, this);
		},

		/**
		 * Handle broadcast.
		 * @param {gui.Broadcast} broadcast
		 */
		onbroadcast: function(b) {
			var keys = this._newprops;
			switch (b.type) {
				case edb.BROADCAST_ACCESS:
					var type = b.data[0];
					var name = b.data[1];
					var id = type.$instanceid;
					if (!keys[id]) {
						keys[id] = {
							object: type
						};
					}
					if (name) {
						if (!keys[id].properties) {
							keys[id].properties = {};
						}
						keys[id].properties[name] = true;
					}
					break;
			}
		},

		/**
		 * Handle change.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			if (
				changes.some(function(c) {
					var id = c.object.$instanceid,
						clas = c.object.$classname,
						name = c.name;
					if (edbml.$rendering && edbml.$rendering[id]) {
						console.error(
							'Don\'t update "' +
								name +
								'" of the ' +
								clas +
								' while ' +
								'rendering, it will cause the rendering to run in an endless loop. '
						);
					} else if (this._oldprops[id]) {
						var props = this._oldprops[id].properties;
						try {
							if (!name || props[name]) {
								return true;
							}
						} catch (todoexception) {
							// console.error(this._oldprops[id].toString(), name);
							// TODO: fix sceario with selectedIndex................
						}
						return false;
					} else {
						console.error('Out of synch: ' + id);
					}
				}, this)
			) {
				this._schedule();
			}
		},

		/**
		 * Handle life.
		 * @param {gui.Life} life
		 */
		onlife: function(l) {
			if (l.type === gui.LIFE_ENTER) {
				if (!this.spirit.life.rendered) {
					// spirit did a manual run?
					this.run.apply(this, this._arguments || []);
				}
				this.spirit.life.remove(l.type, this);
				this._arguments = null;
			}
		},

		/**
		 *
		 */
		suspend: chained(function() {
			this.suspended = true;
			if (edbml.debug) {
				console.debug('(Supending ScriptPlugin)', this.$instanceid);
			}
		}),

		unsuspend: chained(function(run) {
			this.suspended = false;
			if (edbml.debug) {
				console.debug('(Unsupending ScriptPlugin)', this.$instanceid);
			}
		}),

		// Privileged ..............................................................

		/**
		 * Hijacking the {edb.InputPlugin} which has been
		 * designed to work without an associated spirit.
		 * Accessed by method {edbml#$runtimeconfigure}
		 * @type {edb.InputPlugin}
		 */
		$input: null,

		// Private .................................................................

		/**
		 * Script SRC.
		 * @type {String}
		 */
		_src: null,

		/**
		 * It's a function.
		 * @type {function}
		 */
		_script: null,

		/**
		 * Update manager.
		 * @type {edbml.UpdateManager}
		 */
		_updater: null,

		/**
		 * Tracking what arrays and objects (and what properties) to observe.
		 * @type {Map<String,boolean>}
		 */
		_oldprops: null,

		/**
		 * Something related to the above.
		 * @type {Map<String,boolean>}
		 */
		_newprops: null,

		/**
		 * Cache arguments for postponed execution.
		 * @type {Arguments}
		 */
		_arguments: null,

		/**
		 * Snapshot latest HTML to avoid parsing duplicates.
		 * @type {String}
		 */
		_html: null,

		/**
		 * AnimationFrame index.
		 * @type {number}
		 */
		_frameindex: -1,

		/**
		 * Parse processing instructions. Add input listeners in
		 * batch to prevent prematurly getting a `this.$input.done`
		 * @param {Array<object>} pis
		 */
		_process: function(pis) {
			if (pis) {
				var optional = [];
				var required = [];
				if (
					pis.reduce(function(hasinput, pi) {
						var keys = Object.keys(pi);
						var name = keys[0];
						var atts = pi[name];
						if (name === 'input') {
							var list = atts.required === false ? optional : required;
							list.push(guiObject.lookup(atts.type));
							return true;
						}
						return hasinput;
					}, false)
				) {
					this.$input = new edb.InputPlugin();
					this.$input.connect(required, this, true);
					this.$input.connect(optional, this, false);
				}
			}
		},

		/**
		 * Start it.
		 */
		_start: function() {
			edbml.$rendering = this._oldprops || {};
			Broadcast.add(edb.BROADCAST_ACCESS, this);
			edb.$accessaware = true;
			this._newprops = {};
		},

		/**
		 * Stop it.
		 */
		_stop: function() {
			var oldprops = this._oldprops,
				newprops = this._newprops;
			edbml.$rendering = null;
			Broadcast.remove(edb.BROADCAST_ACCESS, this);
			edb.$accessaware = false;
			Object.keys(oldprops).forEach(function(id) {
				if (!newprops[id]) {
					oldprops[id].object.removeObserver(this);
					delete oldprops[id];
				}
			}, this);
			Object.keys(newprops).forEach(function(id) {
				var oldx = oldprops[id];
				var newx = newprops[id];
				if (oldx) {
					if (newx.properties) {
						oldx.properties = newx.properties;
					}
				} else {
					oldprops[id] = newprops[id];
					oldprops[id].object.addObserver(this);
					delete newprops[id];
				}
			}, this);
			this._newprops = null;
		},

		/**
		 * Schedule rendering.
		 */
		_schedule: function() {
			Tick.cancelFrame(this._frameindex);
			var spirit = this.spirit;
			var input = this.$input;
			var runnow = function() {
				if (!spirit.life.destructed && (!input || input.done)) {
					this.run();
				}
			}.bind(this);
			if (spirit.life.entered) {
				if (spirit.life.rendered) {
					this._frameindex = Tick.nextFrame(runnow);
				} else {
					runnow();
				}
			} else {
				spirit.life.add(gui.LIFE_ENTER, this);
			}
		},

		/**
		 * TODO: Wonder about dispatching stuff if nothing has changed...
		 * @param {gui.Spirit} spirit
		 */
		_status: function(spirit) {
			spirit.life.rendered = true;
			spirit.onrender({
				// TODO: some kind of RenderSummary...
				first: !this.ran
			});
			spirit.life.dispatch(gui.LIFE_RENDER); // TODO: move to `edbml` namespace
			spirit.action.dispatch(edbml.ACTION_RENDER);
		},

		/**
		 * Run the script while monitoring edb.Type inspections.
		 * @returns {String}
		 */
		_run: function(/* arguments */) {
			this._start();
			var html = this._script.apply(this.spirit, arguments);
			this._stop();
			return html;
		},

		/**
		 * This seems to hotfix a scenario where the script has multiple
		 * (global) inputs defined and you then inject a private input.
		 * This action results in calling `run` immediately without
		 * waiting for the global inputs to be registered. When fixed,
		 * revert back to throwing an error (for manually running a
		 * waiting script).
		 */
		_notready: function() {
			var input = this.$input,
				type;
			(input._watches || []).forEach(function(edbType) {
				if ((type = edb.get(edbType))) {
					input.$oninput(new edb.Input(edbType, type));
				}
			}, this);
			/*
			if(gui.debug) {
				// Alert the user when manually running a script that is not ready.
				console.warn ( this.spirit + " can't run (waiting for input)" );
			}
			*/
		},

		/**
		 * Operation failed because no script was loaded.
		 */
		_notloaded: function() {
			console.error('Spiritual EDBML: No script loaded for ' + this.spirit);
		},

		/**
		 * No input expected.
		 */
		_noinputexpected: function() {
			console.error('Spiritual EDBML: No input expected for ' + this.spirit);
		},

		/**
		 * Focus is inside the spirit? Compute a fitting	CSS selector so that we
		 * may restore focus if and when the focused field gets replaced. This will
		 * in given case nuke the undo stack, but you can't both forget to scope
		 * your input fields (with an ID) and have a pleasent website, so please do.
		 * TODO: warning in debug mode when an ID is missing.
		 * @returns {string}
		 */
		_focusedfield: function() {
			var focused;
			try {
				focused = document.activeElement;
			} catch (ieException) {
				// Occasional IE failure
				focused = null;
			}
			if (focused && Type.isElement(focused)) {
				// Ridiculous IE 11 failure
				if (DOMPlugin.contains(this.spirit.element, focused)) {
					return this._focusselector(focused);
				}
			}
			return null;
		},

		/**
		 * Compute selector for form field. We scope it to
		 * nearest element ID or fallback to document body.
		 * @param {Element} element
		 * @returns {string}
		 */
		_focusselector: function(elm) {
			var index = -1;
			var parts = [];
			function hasid(elem) {
				if (elem.id) {
					try {
						DOMPlugin.q(elem.parentNode, elem.id);
						return true;
					} catch (malformedexception) {}
				}
				return false;
			}
			while (elm && elm.nodeType === Node.ELEMENT_NODE) {
				if (hasid(elm)) {
					parts.push('#' + elm.id);
					elm = null;
				} else {
					if (elm.localName === 'body') {
						parts.push('body');
						elm = null;
					} else {
						index = DOMPlugin.ordinal(elm) + 1;
						parts.push('>' + elm.localName + ':nth-child(' + index + ')');
						elm = elm.parentNode;
					}
				}
			}
			return parts.reverse().join('');
		},

		/**
		 * Refocus that form field.
		 * @param {string} selector
		 */
		_restorefocus: function(selector) {
			var texts = 'textarea, input:not([type=checkbox]):not([type=radio])';
			var field = DOMPlugin.qdoc(selector);
			var focus;
			try {
				focus = document.activeElement;
			} catch (ieException) {
				// Occasional IE failure
				focus = null;
			}
			if (field && field !== focus) {
				// Occasional IE error
				field.focus();
				if (gui.CSSPlugin.matches(field, texts)) {
					field.setSelectionRange(field.value.length, field.value.length);
				}
			}
		}
	});
})(
	gui.Combo.chained,
	gui.Arguments.confirmed,
	gui.Type,
	gui.Tick,
	gui.Object,
	gui.Array,
	gui.DOMPlugin,
	gui.Broadcast
);
