/**
 * This fellow allow us to create a newable constructor that can be "subclassed" via an extend method.
 * Instances of the "class" may use a special `_super` method to override members of the "superclass".
 * TODO: Evaluate static stuff first so that proto can declare vals as static props
 * TODO: Check if static stuff shadows recurring static (vice versa) and warn about it.
 * TODO: It's possible for a prototype to be a prototype, investigate this inception
 * TODO: Assign uppercase properties as constants
 */
gui.Class = {
	/**
	 * Create constructor. Use method `extend` on
	 * the constructor to subclass further.
	 * @param @optional {String} name
	 * @param {object} proto Base prototype
	 * @param {object} protos Prototype extensions
	 * @param {object} recurring Constructor and subconstructor extensions
	 * @param {object} statics Constructor extensions
	 * @returns {function}
	 */
	create: function() {
		var b = this._breakdown_base(arguments);
		var C = this._createclass(null, b.proto, b.name);
		gui.Object.extend(C.prototype, b.protos);
		gui.Object.extend(C, b.statics);
		gui.Property.extendall(b.protos, C.prototype);
		if (b.recurring) {
			gui.Object.each(b.recurring, function(key, val) {
				var desc = Object.getOwnPropertyDescriptor(C, key);
				if (!desc || desc.writable) {
					C[key] = C.$recurring[key] = val;
				}
			});
		}
		return C;
	},

	/**
	 * Get constructor by $classid.
	 * @param {string} classid
	 * @returns {constructor}
	 */
	get: function(classid) {
		return this._classes[classid] || null;
	},

	// Privileged ................................................................

	/**
	 * The `this` keyword around here points to the instance via `apply`.
	 * @param {object} instance
	 * @param {Arguments} arg
	 */
	$constructor: function() {
		var constructor = this.$onconstruct || this.onconstruct;
		var nonenumprop = gui.Property.nonenumerable;
		var returnvalue = this;
		Object.defineProperties(this, {
			$instanceid: nonenumprop({
				value: gui.KeyMaster.generateKey()
			}),
			displayName: nonenumprop({
				value: this.constructor.displayName,
				writable: true
			})
		});
		if (gui.Type.isFunction(constructor)) {
			returnvalue = constructor.apply(this, arguments);
		}
		// if (false) { // if stil an instance of gui.Class (but disabled for now)
		// 	if (gui.Client && gui.Super) {
		// 		gui.Super.$proxy(returnvalue || this);
		// 	}
		// }
		return returnvalue || this;
	},

	// Private ...................................................................

	/**
	 * Mapping $classid to constructors.
	 * @type {Map<string,constructor>}
	 */
	_classes: Object.create(null),

	/**
	 * Nameless name.
	 * @type {String}
	 */
	ANONYMOUS: 'Anonymous',

	/**
	 * TODO: Memoize this!
	 * Self-executing function creates a string property _BODY
	 * which we can as constructor body for classes. The `$name`
	 * will be substituted for the class name. Note that if
	 * called without the `new` keyword, the function acts
	 * as a shortcut the the MyClass.extend method (against
	 * convention, which is to silently imply the `new` keyword).
	 * @type {String}
	 */
	_BODY: (function($name) {
		var body = $name.toString().trim();
		return body.slice(body.indexOf('{') + 1, -1);
	})(function $name() {
		if (this instanceof $name) {
			return gui.Class.$constructor.apply(this, arguments);
		} else {
			return $name.extend.apply($name, arguments);
		}
	}),

	/**
	 * Breakdown arguments for base exemplar only (has one extra argument).
	 * TODO: Something in gui.Arguments instead.
	 * @see {gui.Class#breakdown}
	 * @param {Arguments} args
	 * @returns {object}
	 */
	_breakdown_base: function(args) {
		var named = gui.Type.isString(args[0]);
		return {
			name: named ? args[0] : null,
			proto: args[named ? 1 : 0] || Object.create(null),
			protos: args[named ? 2 : 1] || Object.create(null),
			recurring: args[named ? 3 : 2] || Object.create(null),
			statics: args[named ? 4 : 3] || Object.create(null)
		};
	},

	/**
	 * Break down class constructor arguments. We want to make the string (naming)
	 * argument optional, but we still want to keep is as first argument, so the
	 * other arguments must be identified by whether or not it's present.
	 * TODO: Something in gui.Arguments instead.
	 * @param {Arguments} args
	 * @returns {object}
	 */
	_breakdown_subs: function(args) {
		var named = gui.Type.isString(args[0]);
		return {
			name: named ? args[0] : null,
			protos: args[named ? 1 : 0] || Object.create(null),
			recurring: args[named ? 2 : 1] || Object.create(null),
			statics: args[named ? 3 : 2] || Object.create(null)
		};
	},

	/**
	 * TODO: comments here!
	 * @param {object} proto Prototype of superconstructor
	 * @param {String} name Constructor name (for debug).
	 * @returns {function}
	 */
	_createclass: function(SuperC, proto, name) {
		name = name || gui.Class.ANONYMOUS;
		// TODO: this in devmode if and when we might know the name beforehand
		// C = gui.Function.create ( name, null, this._namedbody ( name ));
		var C = function $Class() {
			if (this instanceof $Class) {
				return gui.Class.$constructor.apply(this, arguments);
			} else {
				return $Class.extend.apply($Class, arguments);
			}
		};
		C.$classid = gui.KeyMaster.generateKey();
		C.prototype = Object.create(proto || null);
		C.prototype.constructor = C;
		C = this._internals(C, SuperC);
		C = this._interface(C);
		C = this._classname(C, name);
		this._classes[C.$classid] = C;
		return C;
	},

	/**
	 * Create subclass for given class.
	 * @param {funciton} SuperC
	 * @param {Object} args
	 * @return {function}
	 */
	_createsubclass: function(SuperC, args) {
		args = this._breakdown_subs(args);
		return this._extendclass(SuperC, args.protos, args.recurring, args.statics, args.name);
	},

	/**
	 * Create subclass constructor.
	 * @param {object} SuperC super constructor
	 * @param {object} protos Prototype extensions
	 * @param {object} recurring Constructor and subconstructor extensions
	 * @param {object} statics Constructor extensions
	 * @param {String} generated display name (for development)
	 * @returns {function} Constructor
	 */
	_extendclass: function(SuperC, protos, recurring, statics, name) {
		var C = this._createclass(SuperC, SuperC.prototype, name);
		gui.Object.extend(C, statics);
		gui.Object.extend(C.$recurring, recurring);
		gui.Object.each(C.$recurring, function(key, val) {
			var desc = Object.getOwnPropertyDescriptor(C, key);
			if (!desc || desc.writable) {
				C[key] = val;
			}
		});
		gui.Property.extendall(protos, C.prototype);
		C = this._classname(C, name);
		return C;
	},

	/**
	 * Setup framework internal propeties.
	 * @param {function} C
	 * @param @optional {function} superclass
	 * @param @optional {Map<String,object>} recurring
	 * @returns {function}
	 */
	_internals: function(C, SuperC) {
		C.$super = null; // what's this?
		C.$subclasses = [];
		C.$superclass = SuperC || null;
		C.$recurring = SuperC ? gui.Object.copy(SuperC.$recurring) : Object.create(null);
		if (SuperC) {
			SuperC.$subclasses.push(C);
		}
		return C;
	},

	/**
	 * Setup standard static methods for extension, mixin and instance checking.
	 * @param {function} C
	 * @returns {function}
	 */
	_interface: function(C) {
		['extend', 'mixin', 'is'].forEach(function(method) {
			C[method] = this[method];
		}, this);
		return C;
	},

	/**
	 * Assign toString() return value to function constructor and instance object.
	 * TODO: validate unique name
	 * @param {constructor} C
	 * @param {String} name
	 * @returns {function}
	 */
	_classname: function(C, name) {
		/*
		 * At this point the $classname is a writable property, it will
		 * become non-writable after we call {gui.Namespace#spacenames}.
		 */
		C.$classname = name || gui.Class.ANONYMOUS;
		Object.defineProperty(C.prototype, '$classname', {
			enumerable: false,
			configurable: true,
			get: function() {
				return this.constructor.$classname;
			}
		});
		C.toString = function() {
			return '[function ' + this.$classname + ']';
		};
		C.prototype.toString = function() {
			return '[object ' + this.constructor.$classname + ']';
		};
		return C;
	},

	/**
	 * Compute constructor body for class of given name.
	 * @param	{[type]} name [description]
	 * @return {[type]}			[description]
	 */
	_namedbody: function(name) {
		return this._BODY.replace(new RegExp('\\$name', 'gm'), gui.Function.safename(name));
	}

	/**
	 * This might do something in the profiler. Not much luck with stack traces.
	 * @see http://www.alertdebugging.com/2009/04/29/building-a-better-javascript-profiler-with-webkit/
	 * @see https://code.google.com/p/chromium/issues/detail?id=17356
	 * @param {function} C
	 * @returns {function}
	 *
	_profiling : function ( C ) {
		var name = C.name || gui.Class.ANONYMOUS;
		[ C, C.prototype ].forEach ( function ( thing ) {
			gui.Object.each ( thing, function ( key, value ) {
				if ( gui.Type.isMethod ( value )) {
					this._displayname ( value, name + "." + key );
				}
			}, this );
		}, this );
		return C;
	},
	*/
};

// Class members ...............................................................

gui.Object.extend(gui.Class, {
	/**
	 * Create subclass. To be called on the class constructor: MyClass.extend()
	 * @param @optional {String} name
	 * @param {object} proto Base prototype
	 * @param {object} protos Prototype methods and properties
	 * @param {object} recurring Constructor and subconstructor extensions
	 * @param {object} statics Constructor extensions
	 * @returns {function} Constructor
	 */
	extend: function() {
		// protos, recurring, statics
		return gui.Class._createsubclass(this, arguments);
	},

	/**
	 * Mixin something.
	 * @param {object} proto
	 * @param {object} recurring
	 * @param {object} statics
	 * @returns {function}
	 */
	mixin: function(proto, recurring, statics) {
		Array.forEach(
			arguments,
			function(mixins, i) {
				if (mixins) {
					gui.Object.each(
						mixins,
						function(name, value) {
							if (i === 0) {
								// TODO: something more elaborate (like defineProperty)
								this.prototype[name] = value;
							} else {
								// TODO: only at index 1 right?
								gui.Class.descendantsAndSelf(this, function(C) {
									C.$recurring[name] = value;
									C[name] = value;
								});
							}
						},
						this
					);
				}
			},
			this
		);
		return this;
	},

	/**
	 * Is instance of this?
	 * @param {object} object
	 * @returns {boolean}
	 */
	is: function(object) {
		return gui.Type.isObject(object) && object instanceof this;
	},

	/**
	 * Deprecated API.
	 */
	isInstance: function() {
		console.error('Deprecated API is derecated');
	}
});

// Class navigation ............................................................

gui.Object.extend(gui.Class, {
	/**
	 * Return superclass. If action is provided, return an array of the results
	 * of executing the action for each subclass with the subclass as argument.
	 * @param {function} C constructor
	 * @param @optional {function} action
	 * @param @optional {object} thisp
	 * @returns {Array<gui.Class|object>}
	 */
	children: function(C, action, thisp) {
		var results = [];
		action = action || gui.Combo.identity;
		C.$subclasses.forEach(function(sub) {
			results.push(action.call(thisp, sub));
		}, thisp);
		return results;
	},

	/**
	 * Apply action recursively to all derived subclasses of given class.
	 * Returns an array of accumulated results. If no action is provided,
	 * returns array of descendant sublasses.
	 * @param {function} C constructor
	 * @param @optional {function} action
	 * @param @optional {object} thisp
	 * @param @internal {Array<gui.Class|object>} results
	 * @returns {Array<gui.Class|object>}
	 */
	descendants: function(C, action, thisp, results) {
		results = results || [];
		action = action || gui.Combo.identity;
		C.$subclasses.forEach(function(sub) {
			results.push(action.call(thisp, sub));
			gui.Class.descendants(sub, action, thisp, results);
		}, thisp);
		return results;
	},

	/**
	 * Return descendant classes and class itself. If action is provided, return
	 * array of the results of executing the action for each descendant class
	 * and class itself with the class as argument.
	 * @param {function} C constructor
	 * @param @optional {function} action
	 * @param @optional {object} thisp
	 * @returns {Array<gui.Class|object>}
	 */
	descendantsAndSelf: function(C, action, thisp) {
		var results = [];
		action = action || gui.Combo.identity;
		results.push(action.call(thisp, C));
		return this.descendants(C, action, thisp, results);
	},

	/**
	 * Return superclass. If action is provided, return the result
	 * of executing the action with the superclass as argument.
	 * @param {function} C constructor
	 * @param @optional {function} action
	 * @param @optional {object} thisp
	 * @returns {gui.Class|object}
	 */
	parent: function(C, action, thisp) {
		if (C && C.$superclass) {
			action = action || gui.Combo.identity;
			return action.call(thisp, C.$superclass);
		}
		return null;
	},

	/**
	 * Return ancestor classes. If action is provided, return array of the results
	 * of executing the action for each ancestor class with the class as argument.
	 * @param {function} C constructor
	 * @param @optional {function} action
	 * @param @optional {object} thisp
	 * @param @internal {<gui.Class|object>} results
	 * @returns {Array<gui.Class|object>}
	 */
	ancestors: function(C, action, thisp, results) {
		results = results || [];
		action = action || gui.Combo.identity;
		if (C.$superclass) {
			results.push(action.call(thisp, C.$superclass));
			gui.Class.ancestors(C.$superclass, action, thisp, results);
		}
		return results;
	},

	/**
	 * Return ancestor classes and class itself. If action is provided, return
	 * array of the results of executing the action for each ancestor class and
	 * class itself with the class as argument.
	 * @param {function} C constructor
	 * @param @optional {function} action Takes the class as argument
	 * @param @optional {object} thisp
	 * @returns {Array<gui.Class|object>}
	 */
	ancestorsAndSelf: function(C, action, thisp) {
		var results = [];
		action = action || gui.Combo.identity;
		results.push(action.call(thisp, C));
		return this.ancestors(C, action, thisp, results);
	},

	/**
	 * Return ancestor classes, descendant classes and class itself. If action is
	 * provided, return array of the results of executing the action for each
	 * related class and class itself with the class as argument.
	 * @param {constructor} C
	 * @param @optional {function} action Takes the class as argument
	 * @param @optional {object} thisp
	 * @returns {Array<<gui.Class|object>>}
	 */
	family: function(C, action, thisp) {
		var results = this.ancestorsAndSelf(C).concat(this.descendants(C));
		if (action) {
			results = results.map(function(Con) {
				return action.call(thisp, Con);
			});
		}
		return results;
	}
});
