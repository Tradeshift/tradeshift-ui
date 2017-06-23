/**
 * Corporate base collection.
 * @using {gui.Combo.chained} chained
 * @using {gui.Array} guiArray
 * @extends {edb.Array}
 */
ts.ui.Collection = (function using(chained, guiArray) {
	/**
	 * Get model for item type. Mapping is wrapped in a function call
	 * because the actual constructors aren't parsed at this point :/
	 * Propbably this whole list should be maintained somewhere else
	 * and also broken down into *discrete bundles* for future splitup.
	 * @param {string} item
	 * @return {constructor}
	 */
	function getmodel(item) {
		return (
			{
				text: ts.ui.TextModel,
				input: ts.ui.InputModel,
				form: ts.ui.FormModel,
				menu: ts.ui.MenuModel,
				item: ts.ui.ItemModel,
				select: ts.ui.SelectModel,
				textarea: ts.ui.TextAreaModel,
				date: ts.ui.DatePickerModel,
				button: ts.ui.ButtonModel,
				comment: ts.ui.CommentModel,
				action: ts.ui.ActionModel
			}[item] ||
			(function nomatch() {
				console.error('"' + item + '" not matched to nothing');
				return null;
			})()
		);
	}

	/**
	 * Parse collection input to any suitable type.
	 * @param {ts.ui.Collection} collection
	 * @param {JSONObject|ts.ui.Model} input
	 * @param {string} assumed
	 * @return {constructor|ts.ui.Model}
	 */
	function anything(collection, input, assumed) {
		if (input) {
			if (ts.ui.Model.is(input)) {
				return input;
			} else if (input.item) {
				return getmodel(input.item);
			} else if (assumed) {
				return getmodel(assumed);
			} else {
				if (collection.constructor === ts.ui.Collection) {
					return null; // no enforcement in base class
				} else {
					return nothing(collection);
				}
			}
		}
	}

	/**
	 * Parse collection input to any allowed type. Allowed types may be defined
	 * by a static `allow` property on the collection constructor: `MyCol.allow`
	 * @see {ts.ui.FormItemsCollection} for an example
	 * @param {ts.ui.Collection} collection
	 * @param {JSONObject|ts.ui.Model} input
	 * @param {Array<string>} allowed
	 * @param {string} assumed
	 * @return {constructor|ts.ui.Model}
	 */
	function something(collection, input, allowed, assumed) {
		var Model,
			item = input.item;
		if (item) {
			if (
				ts.ui.Model.is(input) &&
				allowed.some(function(it) {
					return (Model = getmodel(it)).is(input);
				})
			) {
				return input;
			} else if ((Model = getmodel(item))) {
				return Model;
			}
			return badthing(collection, item, allowed);
		} else if (assumed) {
			return getmodel(assumed);
		}
		return nothing(collection);
	}

	/**
	 * Discouraged item type.
	 * @param {ts.ui.Collection} collection
	 * @param {string} item
	 * @param {Array<string>} allowed
	 * @return {null}
	 */
	function badthing(collection, item, allowed) {
		console.error(collection + ' doesn\'t accept "' + item + '", use one of: ' + allowed);
		return null;
	}

	/**
	 * We've got nothing.
	 * @param {ts.ui.Collection} collection
	 * @return {null}
	 */
	function nothing(collection) {
		console.error('Item for ' + collection + " needs an 'item' property");
		return null;
	}

	return edb.Array.extend(
		{
			/**
			 * Friendly name.
			 * @type {string}
			 */
			item: 'collection',

			/**
			 * Disposed? Flagged by a boolean so that this may be synchronized xframe.
			 * @type {boolean}
			 */
			disposed: false,

			/**
			 * Match the incoming JSONs `item` property to a set of
			 * known model constructors and parse to an appropriate type.
			 * The collection can declare (in the `Static` section):
			 *
			 * 1) Which kind of `item` it is ready to accept
			 * 2) What model should be assumed when `item` is missing
			 *
			 * @param {JSONObject|ts.ui.Model} thing
			 * @return {constructor|ts.ui.Model}
			 */
			$of: function(input) {
				var allowed = this.constructor.allow;
				var assumed = this.constructor.assume;
				if (input) {
					return allowed
						? something(this, input, allowed, assumed)
						: anything(this, input, assumed);
				}
				return null; // right?
			},

			/**
			 * Get model by ID or index.
			 * @overides {edb.Array#get}
			 * @param {string|number} id
			 */
			get: function(id) {
				switch (gui.Type.of(id)) {
					case 'number':
						return this.super.get(id);
					case 'string':
						return this.reduce(function(result, model) {
							return result || (model.id && model.id === id ? model : null);
						}, null);
				}
			},

			/**
			 * Bounce collection to HTML string.
			 * @return {string}
			 */
			render: function() {
				return this.map(function(model) {
					return model.render();
				}).join('');
			},

			/**
			 * Remove AND dispose that model.
			 * TODO(jmo@): Support multiple arguments
			 * @returns {ts.ui.Collection} (not the model, since that gets disposed)
			 */
			remove: chained(function(model) {
				guiArray.remove(this, model);
				model.dispose();
			}),

			/**
			 * Contains model?
			 * @param {ts.ui.Model|ts.ui.Collection} model
			 */
			contains: function(model) {
				return this.indexOf(model) > -1;
			},

			/**
			 * Clear this collection. It's always a good idea to reuse a collection
			 * instead of creating a new one, because the existing collection might
			 * have observers attached. @neal: Is this a good name for this method?
			 * @returns {ts.ui.Collection}
			 */
			clear: chained(function() {
				while (this.length) {
					this.pop();
				}
			}),

			/**
			 * Flag as disposed. This would allow associated spirit to dispose
			 * (flagged by a boolean so that this may be synchronized xframe).
			 */
			dispose: function() {
				this.disposed = true;
				this.super.dispose();
			}
		},
		{
			// Static ...............................................................

			/**
			 * Allowed content models (by `item` property).
			 * @type {Array<string>}
			 */
			allow: null,

			/**
			 * Assumed content model (if 'item' property was undeclared).
			 * @type {string}
			 */
			assume: null
		}
	);
})(gui.Combo.chained, gui.Array);
