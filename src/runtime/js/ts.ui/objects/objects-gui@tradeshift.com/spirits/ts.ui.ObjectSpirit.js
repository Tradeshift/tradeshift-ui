/**
 * TradeshiftObject base spirit.
 * @see {ts.ui.CompanyCardSpirit}
 * @extends {ts.ui.Spirit}
 * @using {gui.Type} Type
 * @using {gui.Combo.chained}
 * @using {gui.Arguments.confirmed}
 */
ts.ui.ObjectSpirit = (function using(Type, chained, confirmed) {
	// TODO: automatically quote keys (for inline JSON island)
	// TODO: Perhaps use {gui.ConfigPlugin#jsonify} for this?
	// function escape(json) {
	// 	var regx = /({|,)(?:\s*)(?:')?([A-Za-z_$\.][A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*):/g;
	// 	return json.replace(regx, '$1"$2":');
	// }

	return ts.ui.Spirit.extend(
		{
			/**
			 * Set the GUID (via HTML attribute ts.id="myguid").
			 * @type {string}
			 */
			id: {
				getter: function() {
					return this._guid;
				},
				setter: function(guid) {
					this._guid = guid;
					this._model = null;
					this.input.connect(this.constructor.collection);
				}
			},

			/**
			 * Show details on click (via HTML attribute ts.details="true").
			 * @type {boolean}
			 */
			details: {
				getter: function() {
					return this._details;
				},
				setter: function(enable) {
					if (enable === '') {
						// TODO: This by default in {gui.AttPlugin}
						enable = true;
					}
					if (Type.isBoolean(enable)) {
						this._toggledetails(enable, this.element);
						this._details = enable;
					}
				}
			},

			/**
			 * Scenario 1: The model is extracted from embedded JSON.
			 * There's no code to support the scenario where JSON is
			 * injected via the `ts.render` attribute because that's
			 * just built into spirits via the {gui.ConfigPlugin}.
			 */
			onconfigure: function() {
				this.super.onconfigure();
				var script,
					path = 'script[type="application/json"]';
				this.css.add('ts-object');
				this.script.load(ts.ui.ObjectSpirit.edbml);
				if ((script = this.dom.q(path))) {
					// console.log(encodeURIComponent(script.textContent.trim()));
					this.render(JSON.parse(script.textContent));
				} else {
					this.script.run(this._model);
				}
			},

			/**
			 * If the element wraped by button or a link without a `href`,
			 * The component should detail itself in an Aside when clicked.
			 * TODO: Make sure that ENTER key also works!
			 */
			onevent: function(e) {
				this.super.onevent(e);
				switch (e.type) {
					case 'click':
						if (this._details) {
							this.open();
						}
						break;
				}
			},

			/**
			 * Scenario 2: The model is injected manually by some guy.
			 * @param {JSONObject|ts.ui.ObjectModel} json
			 * @returns {ts.ui.ObjectSpirit}
			 */
			render: confirmed('object')(
				chained(function(json) {
					if (this._assignmodel(json)) {
						this._guid = this._model.id;
						this.script.run(this._model);
					}
				})
			),

			/**
			 * The sub-class should implented the function
			 * May be we implented it here
			 * Open an aside to show some details
			 */
			open: function() {},

			/**
			 * Assign new model from argument, disposing any old model.
			 * @param {JSONObject|ts.ui.CompanyCardModel} data
			 * @returns {boolean} True if a model was assigned
			 */
			_assignmodel: function(data) {
				var Model = this.constructor.model;
				if (data) {
					if (this._model) {
						this._model.dispose();
					}
					this._model = Model.from(data);
				}
				return this._model !== null;
			},

			/**
			 * Scenario 3: The model is retrieved from public output
			 * (The listener is setup when someone changes the `id`).
			 * @param {edb.Input} input
			 */
			oninput: function(input) {
				this.super.oninput(input);
				var Collection = this.constructor.collection;
				if (input.type === Collection) {
					var thismodel = input.data.get(this.id);
					if (thismodel) {
						this.input.disconnect(Collection);
						this._assignmodel(thismodel);
						if (this.script.loaded) {
							this.script.run(thismodel);
						}
					}
				}
			},

			// Private .................................................................

			/**
			 * Model GUID.
			 * @type {string}
			 */
			_guid: null,

			/**
			 * The model itself.
			 * @type {ts.ui.ObjectModel}
			 */
			_model: null,

			/**
			 * Show details view on click?
			 * @type {boolean}
			 */
			_details: false,

			/**
			 * Setup to show details in Aside.
			 * @param {boolean} on
			 * @param {Element} elm
			 */
			_toggledetails: function(on, elm) {
				this.css.shift(on, 'ts-has-details');
				this.event.shift(on, 'click');
				if (!this.dom.tag().match(/button|a/)) {
					elm.tabIndex = on ? this.att.get('tabindex') || 0 : -1;
				}
			}
		},
		{
			// Static ...............................................................

			/**
			 * Scenario 1 and 2: Convert injected JSON to this
			 * kind of model. The subclass should define this.
			 * @type {constructor}
			 */
			model: ts.ui.ObjectModel,

			/**
			 * Scenario 3: Fetch the model from public output of
			 * this collection.	The subclass should define this.
			 * @type {constructor}
			 */
			collection: ts.ui.ObjectCollection
		}
	);
})(gui.Type, gui.Combo.chained, gui.Arguments.confirmed);
