/**
 * Tracking EDB input. Note that the {edb.ScriptPlugin} is using this
 * plugin, so don't assume the existence of `this.spirit` around here.
 * (the ScriptPlugin residers over in the edbml module, if you wonder).
 * @extends {gui.TrackerPlugin}
 * @using {gui.Combo.chained} chained
 * @using {edb.Input} Input
 */
edb.InputPlugin = (function using(chained, Input) {
	return gui.TrackerPlugin.extend({
		/**
		 * True when one of each expected input type has been collected.
		 * @type {boolean}
		 */
		done: true,

		/**
		 * Construction time.
		 * @overrides {gui.Tracker#onconstruct}
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._watches = [];
			this._matches = [];
			this._needing = [];
		},

		/**
		 * Destruction time.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this.disconnect(this._watches);
		},

		/**
		 * Connect to output of one or more Types.
		 * @param {edb.Type|String|Array<edb.Type|String>} arg
		 * @param @optional {IInputHandler} handler Defaults to this.spirit
		 * @param @optional {boolean} required
		 * @returns {edb.InputPlugin}
		 */
		connect: chained(function(arg, handler, required) {
			var Types = Input.$breakdown(arg);
			if (Types.length) {
				this.done = this.done && required === false;
				Types.forEach(function(Type) {
					this._addchecks(Type.$classid, [handler || this.spirit]);
					this._watches.push(Type);
					if (required) {
						this._needing.push(Type);
					}
				}, this);
				Input.$connect(Types, this);
			}
		}),

		/**
		 * Disconnect from output of one or more Types.
		 * TODO: Cleanup more stuff?
		 * @param {edb.Type|String|Array<edb.Type|String>} arg
		 * @param @optional {IInputHandler} handler Defaults to this.spirit
		 * @returns {gui.edb.InputPlugin}
		 */
		disconnect: chained(function(arg, handler) {
			var Types = Input.$breakdown(arg);
			if (Types.length) {
				Types.forEach(function(Type) {
					this._removechecks(Type.$classid, [handler || this.spirit]);
					gui.Array.remove(this._watches, Type);
					gui.Array.remove(this._needing, Type);
					this._matches = this._matches.filter(function(input) {
						return input.type !== Type;
					});
				}, this);
				Input.$disconnect(Types, this);
				this.done = this._done();
			}
		}),

		/**
		 * TODO: this
		 */
		one: function() {
			console.error('Not supported just yet: ' + this + '.one()');
		},

		/**
		 * Get Type instance for latest input of Type (or closest match).
		 * TODO: Safeguard somewhat
		 * @param {constructor} Type
		 * @returns {object}
		 */
		get: function(Type) {
			var Types = this._matches.map(function(input) {
				return input.data.constructor;
			});
			var best = Input.$bestmatch(Type, Types, false);
			var input = best
				? this._matches
						.filter(function(inputMatch) {
							return inputMatch.type === best;
						})
						.shift()
				: null;
			return input ? input.data : null;
		},

		/**
		 * @implements {Input.IInputHandler}
		 * @param {edb.Input} input
		 */
		oninput: function(input) {
			this.$oninput(input);
		},

		/**
		 * Collect matching input.
		 * @param {Input} input
		 */
		match: function(input) {
			var needstesting = !this._matches.length;
			if (
				needstesting ||
				this._matches.every(function(match) {
					return match.$instanceid !== input.$instanceid;
				})
			) {
				return this._maybeinput(input);
			}
			return false;
		},

		// Deprecated ..............................................................

		/**
		 * @deprecated
		 */
		add: function() {
			console.error('Deprecated API is deprecated: input.add(). Use input.connect()');
			return this.connect.apply(this, arguments);
		},

		/**
		 * @deprecated
		 */
		remove: function() {
			console.error('Deprecated API is deprecated: input.remove(). Use input.disconnect()');
			return this.disconnect.apply(this, arguments);
		},

		// Privileged ..............................................................

		/**
		 * Evaluate input.
		 * @param {edb.Input} input
		 */
		$oninput: function(input) {
			if (input) {
				if (input.data === null) {
					this._mayberevoke(input);
					return false;
				} else {
					return this.match(input);
				}
			} else {
				// debugging...
				throw new TypeError('Bad input: ' + input + ' ' + (this.spirit || ''));
			}
		},

		// Private .................................................................

		/**
		 * Expecting instances of these types (or best match).
		 * @type {Array<constructor>}
		 */
		_watches: null,

		/**
		 * Latest (best) matches, one of each expected type.
		 * @type {Array<Input>}
		 */
		_matches: null,

		/**
		 * Listing strictly `required` types (or best match).
		 * @type {Array<constructor>}
		 */
		_needing: null,

		/**
		 * If input matches registered type, update handlers.
		 * @param {Input} input
		 */
		_maybeinput: function(input) {
			var best = Input.$bestmatch(input.type, this._watches, true);
			if (best) {
				this._updatematch(input, best);
				this.done = this._done();
				this._updatehandlers(input);
				return true;
			}
			return false;
		},

		/**
		 * Evaluate revoked output.
		 * @param {Input} input
		 */
		_mayberevoke: function(input) {
			var matches = this._matches;
			var watches = this._watches;
			var best = Input.$bestmatch(input.type, watches, true);
			if (best) {
				var oldinput = matches.filter(function(inputFilter) {
					return inputFilter.type === best;
				})[0];
				var index = matches.indexOf(oldinput);
				matches.splice(index, 1);
				this.done = this._done();
				if (!this.done) {
					input.revoked = true;
					this._updatehandlers(input);
				}
			}
		},

		/**
		 * Register match for type (remove old match if any).
		 * @param {Input} newinput
		 * @param {constructor} bestmatch
		 */
		_updatematch: function(newinput, bestmatch) {
			var matches = this._matches,
				oldindex = -1,
				oldrating = -1,
				newrating = Input.$rateone(newinput.type, bestmatch);
			matches.forEach(function oldbestmatch(match, i) {
				oldrating = Input.$rateone(match.type, bestmatch);
				if (oldrating > -1 && oldrating <= newrating) {
					oldindex = i;
				}
			});
			if (oldindex > -1) {
				matches[oldindex] = newinput;
			} else {
				matches.push(newinput);
			}
		},

		/**
		 * Update input handlers.
		 * @param {Input} input
		 */
		_updatehandlers: function(input) {
			gui.Class.ancestorsAndSelf(
				input.type,
				function(Type) {
					var list = this._trackedtypes[Type.$classid];
					if (list) {
						list.forEach(function(checks) {
							var handler = checks[0];
							handler.oninput(input);
						});
					}
				},
				this
			);
		},

		/**
		 * All required inputs has been aquired?
		 * @returns {boolean}
		 */
		_done: function() {
			var needs = this._needing;
			var haves = this._matches;
			return needs.every(function(Type) {
				return haves.some(function(input) {
					return input.data instanceof Type;
				});
			});
		},

		/**
		 * Cleanup when destructed.
		 * @param {String} type
		 * @param {Array<object>} checks
		 */
		_cleanup: function(classid, checks) {
			if (this._removechecks(classid, checks)) {
				var Type = gui.Class.get(classid);
				Input.$disconnect(Type, this);
			}
		}
	});
})(gui.Combo.chained, edb.Input);
