/**
 * Corporate base model.
 * @extends {edb.Object}
 * @using {gui.Type} Type
 */
ts.ui.Model = (function using(Type) {
	return edb.Object.extend({
		/**
		 * @optional
		 * @type {string}
		 */
		id: null,

		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'model',

		/**
		 * Disposed? Flagged by a boolean so that this may be synchronized xframe.
		 * @type {boolean}
		 */
		disposed: false,

		/**
		 * TODO: This (kind of) property should be standard in EDBML.
		 */
		tempdirtyflag: -1,

		/**
		 * Verify that we've set the badly named `item` property which is supposed to
		 * let us match any lump of raw JSON to a particular Model constructor.
		 * TODO (jmo@): The name of this makes sense for menu-items, form-items,
		 * toolbar-items etc. but something more generic would come in handy...
		 */
		onconstruct: function() {
			this.super.onconstruct();
			if (gui.debug && this.item === 'model') {
				console.error(
					"A unique property 'item' is missing from " + this,
					JSON.stringify(this, null, true)
				);
			}
		},

		/**
		 * Bounce model to HTML string (carelessly mixing "models" and "views").
		 * The returned HTML may often be computed by use of an EDBML template.
		 * @return {string}
		 */
		render: function() {
			return '<p class="todo">' + this.$classname + '.render()</p>';
		},

		/**
		 * Flag as disposed. This would allow any associated spirit to
		 * dispose. This setup has not been fully implemented just yet.
		 * TODO (jmo@): in Spiritual EDB, allow time for synced types!
		 */
		dispose: function() {
			this.disposed = true;
			// this.super.dispose(); // hotfix: not enough time to sync the status!
			gui.Tick.time(
				function() {
					edb.Type.$destruct(this);
				},
				0,
				this
			);
		},

		// Privileged ..............................................................

		/**
		 * Mark model dirty when it can't figure that out.
		 * TODO: This method should be standard in EDBML.
		 */
		$dirty: function() {
			this.tempdirtyflag = Math.random();
		},

		// Private .................................................................

		/**
		 * Invoke that function with optional arguments *only if* it's defined.
		 * If the `action` argument is a string, we'll compile it to a function.
		 * Note that the `this` keyword will in either case point to this model.
		 * TODO: Support multiple args
		 * @param {string|function} action
		 * @returns {boolan} True if the action was called
		 */
		_maybeinvoke: function(action, arg) {
			if (action) {
				var args = [];
				if (arguments.length > 1) {
					args.push(arg);
				}
				if (Type.isString(action)) {
					action = new Function(action);
				}
				action.apply(this, args);
			}
			return !!action;
		}
	});
})(gui.Type);
